import type { PascalSqlSnippet } from './pasParser';

export interface InferredSqlTable {
  name: string;
  alias?: string;
}

export interface InferredSqlJoin {
  type: 'inner' | 'left' | 'right' | 'full' | 'unknown';
  table: InferredSqlTable;
  condition?: string;
}

export interface InferredSqlQuery {
  methodName: string;
  tables: InferredSqlTable[];
  joins: InferredSqlJoin[];
  where?: string;
  orderBy?: string;
}

const tablePattern = /\bfrom\s+([\w.]+)(?:\s+(\w+))?/i;
const joinPattern = /\b(inner|left|right|full)?\s*join\s+([\w.]+)(?:\s+(\w+))?\s+on\s+(.+?)(?=\b(?:inner|left|right|full)?\s*join\b|\bwhere\b|\border\s+by\b|$)/gi;
const wherePattern = /\bwhere\s+(.+?)(?=\border\s+by\b|$)/i;
const orderByPattern = /\border\s+by\s+(.+)$/i;

export function inferDatabaseQueries(snippets: PascalSqlSnippet[]): InferredSqlQuery[] {
  return snippets.map((snippet) => inferDatabaseQuery(snippet));
}

export function inferDatabaseQuery(snippet: PascalSqlSnippet): InferredSqlQuery {
  const sql = normalizeSql(snippet.text);
  const tables: InferredSqlTable[] = [];
  const fromMatch = sql.match(tablePattern);

  if (fromMatch) {
    tables.push({ name: fromMatch[1], alias: normalizeAlias(fromMatch[2]) });
  }

  const joins = [...sql.matchAll(joinPattern)].map((match) => {
    const table = { name: match[2], alias: normalizeAlias(match[3]) };
    tables.push(table);
    return {
      type: normalizeJoinType(match[1]),
      table,
      condition: match[4]?.trim()
    } satisfies InferredSqlJoin;
  });

  return {
    methodName: snippet.methodName,
    tables: dedupeTables(tables),
    joins,
    where: sql.match(wherePattern)?.[1]?.trim(),
    orderBy: sql.match(orderByPattern)?.[1]?.trim()
  };
}

function normalizeSql(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeAlias(value?: string): string | undefined {
  if (!value) return undefined;
  const reserved = new Set(['where', 'inner', 'left', 'right', 'full', 'join', 'order']);
  return reserved.has(value.toLowerCase()) ? undefined : value;
}

function normalizeJoinType(value?: string): InferredSqlJoin['type'] {
  if (!value) return 'unknown';
  const normalized = value.toLowerCase();
  if (normalized === 'inner' || normalized === 'left' || normalized === 'right' || normalized === 'full') return normalized;
  return 'unknown';
}

function dedupeTables(tables: InferredSqlTable[]): InferredSqlTable[] {
  const seen = new Set<string>();
  return tables.filter((table) => {
    const key = `${table.name}:${table.alias ?? ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
