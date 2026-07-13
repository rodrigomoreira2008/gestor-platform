import type { InferredSqlQuery } from './databaseInference';

export interface InferredRelationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  dependentTable?: string;
  dependentColumn?: string;
  principalTable?: string;
  principalColumn?: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

const equalityPattern = /([\w]+)\.([\w]+)\s*=\s*([\w]+)\.([\w]+)/g;

export function inferRelationships(queries: InferredSqlQuery[]): InferredRelationship[] {
  const relationships = queries.flatMap((query) => query.joins.flatMap((join) => inferRelationshipsFromCondition(query, join.condition ?? '')));
  return dedupeRelationships(relationships);
}

function inferRelationshipsFromCondition(query: InferredSqlQuery, condition: string): InferredRelationship[] {
  const aliasToTable = new Map<string, string>();
  for (const table of query.tables) {
    aliasToTable.set(normalizeName(table.alias ?? table.name), table.name);
    aliasToTable.set(normalizeName(table.name), table.name);
  }

  return [...condition.matchAll(equalityPattern)].map((match) => {
    const leftAlias = match[1] ?? '';
    const leftColumn = match[2] ?? '';
    const rightAlias = match[3] ?? '';
    const rightColumn = match[4] ?? '';
    const leftTable = aliasToTable.get(normalizeName(leftAlias)) ?? leftAlias;
    const rightTable = aliasToTable.get(normalizeName(rightAlias)) ?? rightAlias;
    const confidence = inferConfidence(leftColumn, rightColumn);
    const direction = inferDirection(leftTable, leftColumn, rightTable, rightColumn);

    return {
      sourceTable: leftTable,
      sourceColumn: leftColumn,
      targetTable: rightTable,
      targetColumn: rightColumn,
      ...direction,
      confidence,
      evidence: `${query.methodName}: ${condition}`
    } satisfies InferredRelationship;
  });
}

function inferDirection(leftTable: string, leftColumn: string, rightTable: string, rightColumn: string): Partial<InferredRelationship> {
  const leftPrimary = isPrimaryKeyCandidate(leftColumn);
  const rightPrimary = isPrimaryKeyCandidate(rightColumn);

  if (leftPrimary && !rightPrimary) {
    return {
      dependentTable: rightTable,
      dependentColumn: rightColumn,
      principalTable: leftTable,
      principalColumn: leftColumn
    };
  }

  if (rightPrimary && !leftPrimary) {
    return {
      dependentTable: leftTable,
      dependentColumn: leftColumn,
      principalTable: rightTable,
      principalColumn: rightColumn
    };
  }

  const leftReferencesRight = referencesTable(leftColumn, rightTable);
  const rightReferencesLeft = referencesTable(rightColumn, leftTable);

  if (leftReferencesRight && !rightReferencesLeft) {
    return {
      dependentTable: leftTable,
      dependentColumn: leftColumn,
      principalTable: rightTable,
      principalColumn: rightColumn
    };
  }

  if (rightReferencesLeft && !leftReferencesRight) {
    return {
      dependentTable: rightTable,
      dependentColumn: rightColumn,
      principalTable: leftTable,
      principalColumn: leftColumn
    };
  }

  return {};
}

function inferConfidence(leftColumn: string, rightColumn: string): InferredRelationship['confidence'] {
  const left = normalizeName(leftColumn);
  const right = normalizeName(rightColumn);
  if ((isPrimaryKeyCandidate(leftColumn) && isForeignKeyCandidate(rightColumn)) || (isPrimaryKeyCandidate(rightColumn) && isForeignKeyCandidate(leftColumn))) return 'high';
  if (left === 'id' || right === 'id') return 'high';
  if (isForeignKeyCandidate(leftColumn) || isForeignKeyCandidate(rightColumn)) return 'medium';
  return 'low';
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
  const normalizedTable = singularize(normalizeName(table));
  return normalizedColumn.length > 2 && (normalizedTable.includes(normalizedColumn) || normalizedColumn.includes(normalizedTable));
}

function dedupeRelationships(relationships: InferredRelationship[]): InferredRelationship[] {
  const seen = new Set<string>();
  return relationships.filter((relationship) => {
    const sides = [
      `${normalizeName(relationship.sourceTable)}.${normalizeName(relationship.sourceColumn)}`,
      `${normalizeName(relationship.targetTable)}.${normalizeName(relationship.targetColumn)}`
    ].sort();
    const key = sides.join('<->');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function singularize(value: string): string {
  if (value.endsWith('oes')) return `${value.slice(0, -3)}ao`;
  if (value.endsWith('ais')) return `${value.slice(0, -3)}al`;
  if (value.endsWith('is')) return value.slice(0, -1);
  if (value.endsWith('s')) return value.slice(0, -1);
  return value;
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}
