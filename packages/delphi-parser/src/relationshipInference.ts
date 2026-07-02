import type { InferredSqlQuery } from './databaseInference';

export interface InferredRelationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
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
    aliasToTable.set(table.alias ?? table.name, table.name);
  }

  return [...condition.matchAll(equalityPattern)].map((match) => {
    const leftAlias = match[1];
    const leftColumn = match[2];
    const rightAlias = match[3];
    const rightColumn = match[4];
    const leftTable = aliasToTable.get(leftAlias) ?? leftAlias;
    const rightTable = aliasToTable.get(rightAlias) ?? rightAlias;
    const confidence = inferConfidence(leftColumn, rightColumn);

    return {
      sourceTable: leftTable,
      sourceColumn: leftColumn,
      targetTable: rightTable,
      targetColumn: rightColumn,
      confidence,
      evidence: `${query.methodName}: ${condition}`
    } satisfies InferredRelationship;
  });
}

function inferConfidence(leftColumn: string, rightColumn: string): InferredRelationship['confidence'] {
  const left = leftColumn.toLowerCase();
  const right = rightColumn.toLowerCase();
  if (left === 'id' || right === 'id') return 'high';
  if (left.endsWith('id') || right.endsWith('id') || left.includes('codigo') || right.includes('codigo')) return 'medium';
  return 'low';
}

function dedupeRelationships(relationships: InferredRelationship[]): InferredRelationship[] {
  const seen = new Set<string>();
  return relationships.filter((relationship) => {
    const key = `${relationship.sourceTable}.${relationship.sourceColumn}->${relationship.targetTable}.${relationship.targetColumn}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
