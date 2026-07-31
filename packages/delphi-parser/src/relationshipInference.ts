import type { InferredSqlJoin, InferredSqlQuery } from './databaseInference';

export interface InferredRelationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  dependentTable?: string;
  dependentColumn?: string;
  principalTable?: string;
  principalColumn?: string;
  cardinality: 'many-to-one' | 'one-to-one' | 'unknown';
  optionality: 'required' | 'optional' | 'unknown';
  joinType: InferredSqlJoin['type'];
  selfReference: boolean;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

const equalityPattern = /([\w\[\]"`]+)\.([\w\[\]"`]+)\s*=\s*([\w\[\]"`]+)\.([\w\[\]"`]+)/g;

export function inferRelationships(queries: InferredSqlQuery[]): InferredRelationship[] {
  const relationships = queries.flatMap((query) => query.joins.flatMap((join) => inferRelationshipsFromCondition(query, join)));
  return dedupeRelationships(relationships);
}

function inferRelationshipsFromCondition(query: InferredSqlQuery, join: InferredSqlJoin): InferredRelationship[] {
  const aliasToTable = new Map<string, string>();
  for (const table of query.tables) {
    aliasToTable.set(normalizeName(table.alias ?? table.name), cleanIdentifier(table.name));
    aliasToTable.set(normalizeName(table.name), cleanIdentifier(table.name));
  }

  const condition = join.condition ?? '';
  return [...condition.matchAll(equalityPattern)].map((match) => {
    const leftAlias = cleanIdentifier(match[1] ?? '');
    const leftColumn = cleanIdentifier(match[2] ?? '');
    const rightAlias = cleanIdentifier(match[3] ?? '');
    const rightColumn = cleanIdentifier(match[4] ?? '');
    const leftTable = aliasToTable.get(normalizeName(leftAlias)) ?? leftAlias;
    const rightTable = aliasToTable.get(normalizeName(rightAlias)) ?? rightAlias;
    const direction = inferDirection(leftTable, leftColumn, rightTable, rightColumn);
    const confidence = inferConfidence(leftColumn, rightColumn, direction);
    const cardinality = inferCardinality(leftColumn, rightColumn, direction);
    const optionality = inferOptionality(join, direction);

    return {
      sourceTable: leftTable,
      sourceColumn: leftColumn,
      targetTable: rightTable,
      targetColumn: rightColumn,
      ...direction,
      cardinality,
      optionality,
      joinType: join.type,
      selfReference: sameName(leftTable, rightTable),
      confidence,
      evidence: `${query.methodName}: ${join.type} join ${join.table.name} on ${condition}`
    } satisfies InferredRelationship;
  });
}

function inferDirection(leftTable: string, leftColumn: string, rightTable: string, rightColumn: string): Partial<InferredRelationship> {
  const leftPrimary = isPrimaryKeyCandidate(leftColumn);
  const rightPrimary = isPrimaryKeyCandidate(rightColumn);

  if (leftPrimary && !rightPrimary) {
    return { dependentTable: rightTable, dependentColumn: rightColumn, principalTable: leftTable, principalColumn: leftColumn };
  }

  if (rightPrimary && !leftPrimary) {
    return { dependentTable: leftTable, dependentColumn: leftColumn, principalTable: rightTable, principalColumn: rightColumn };
  }

  const leftReferencesRight = referencesTable(leftColumn, rightTable);
  const rightReferencesLeft = referencesTable(rightColumn, leftTable);

  if (leftReferencesRight && !rightReferencesLeft) {
    return { dependentTable: leftTable, dependentColumn: leftColumn, principalTable: rightTable, principalColumn: rightColumn };
  }

  if (rightReferencesLeft && !leftReferencesRight) {
    return { dependentTable: rightTable, dependentColumn: rightColumn, principalTable: leftTable, principalColumn: leftColumn };
  }

  return {};
}

function inferConfidence(leftColumn: string, rightColumn: string, direction: Partial<InferredRelationship>): InferredRelationship['confidence'] {
  if (direction.dependentTable && direction.principalTable) {
    if ((isPrimaryKeyCandidate(leftColumn) && isForeignKeyCandidate(rightColumn)) || (isPrimaryKeyCandidate(rightColumn) && isForeignKeyCandidate(leftColumn))) return 'high';
    return 'medium';
  }
  if (isPrimaryKeyCandidate(leftColumn) || isPrimaryKeyCandidate(rightColumn)) return 'medium';
  return 'low';
}

function inferCardinality(leftColumn: string, rightColumn: string, direction: Partial<InferredRelationship>): InferredRelationship['cardinality'] {
  if (!direction.dependentTable || !direction.principalTable) return 'unknown';
  const dependentColumn = direction.dependentColumn ?? '';
  if (isPrimaryKeyCandidate(dependentColumn) && isPrimaryKeyCandidate(leftColumn) && isPrimaryKeyCandidate(rightColumn)) return 'one-to-one';
  return 'many-to-one';
}

function inferOptionality(join: InferredSqlJoin, direction: Partial<InferredRelationship>): InferredRelationship['optionality'] {
  if (!direction.dependentTable || !direction.principalTable) return 'unknown';
  if (join.type === 'inner') return 'required';
  if (join.type === 'full' || join.type === 'unknown') return 'unknown';

  const joinedTable = cleanIdentifier(join.table.name);
  if (join.type === 'left') return sameName(joinedTable, direction.principalTable) ? 'optional' : 'unknown';
  if (join.type === 'right') return sameName(joinedTable, direction.dependentTable) ? 'optional' : 'unknown';
  return 'unknown';
}

function isPrimaryKeyCandidate(column: string): boolean {
  const normalized = normalizeName(column);
  return normalized === 'id' || normalized === 'codigo' || normalized === 'controle';
}

function isForeignKeyCandidate(column: string): boolean {
  const normalized = normalizeName(column);
  return normalized.endsWith('id') || normalized.startsWith('id') || normalized.includes('codigo') || normalized.includes('controle');
}

function referencesTable(column: string, table: string): boolean {
  const normalizedColumn = normalizeName(column).replace(/(?:id|codigo|controle)$/i, '');
  const normalizedTable = singularize(normalizeName(table).split('.').at(-1) ?? normalizeName(table));
  return normalizedColumn.length > 2 && (normalizedTable.includes(normalizedColumn) || normalizedColumn.includes(normalizedTable));
}

function dedupeRelationships(relationships: InferredRelationship[]): InferredRelationship[] {
  const byKey = new Map<string, InferredRelationship>();
  for (const relationship of relationships) {
    const sides = [
      `${normalizeName(relationship.sourceTable)}.${normalizeName(relationship.sourceColumn)}`,
      `${normalizeName(relationship.targetTable)}.${normalizeName(relationship.targetColumn)}`
    ].sort();
    const key = sides.join('<->');
    const current = byKey.get(key);
    if (!current || confidenceRank(relationship.confidence) > confidenceRank(current.confidence)) byKey.set(key, relationship);
  }
  return Array.from(byKey.values());
}

function confidenceRank(value: InferredRelationship['confidence']): number {
  return value === 'high' ? 3 : value === 'medium' ? 2 : 1;
}

function cleanIdentifier(value: string): string {
  return value.replace(/^[\["`]+|[\]"`]+$/g, '');
}

function sameName(left?: string, right?: string): boolean {
  return Boolean(left && right && normalizeName(left) === normalizeName(right));
}

function singularize(value: string): string {
  if (value.endsWith('oes')) return `${value.slice(0, -3)}ao`;
  if (value.endsWith('ais')) return `${value.slice(0, -3)}al`;
  if (value.endsWith('is')) return value.slice(0, -1);
  if (value.endsWith('s')) return value.slice(0, -1);
  return value;
}

function normalizeName(value: string): string {
  return cleanIdentifier(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}
