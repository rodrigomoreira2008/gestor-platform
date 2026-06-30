import type { PasClass, PasMethod, PasSqlBlock, PasUnit } from './types.js';

const UNIT_PATTERN = /unit\s+([A-Za-z0-9_]+)\s*;/i;
const USES_PATTERN = /uses\s+([\s\S]*?);/i;
const CLASS_PATTERN = /([A-Za-z0-9_]+)\s*=\s*class(?:\(([^)]+)\))?/gi;
const METHOD_PATTERN = /(procedure|function)\s+(?:(\w+)\.)?(\w+)\s*\(([^)]*)\)\s*(?::\s*([\w\.]+))?\s*;([\s\S]*?)(?=\n\s*(?:procedure|function)\s+|\n\s*initialization\b|\n\s*finalization\b|\n\s*end\.)/gi;
const SQL_STRING_PATTERN = /'([^']*(?:select|insert|update|delete|from|where)[^']*)'/gi;

export function parsePas(content: string): PasUnit {
  const normalized = content.replace(/\r\n/g, '\n');
  const warnings: string[] = [];
  const unitName = normalized.match(UNIT_PATTERN)?.[1] ?? 'unknown';
  const uses = parseUses(normalized);
  const classes = parseClasses(normalized);
  const methods = parseMethods(normalized);
  const sqlBlocks: PasSqlBlock[] = [];

  for (const method of methods) {
    const ownerClass = classes.find((pasClass) => pasClass.name.toLowerCase() === method.owner?.toLowerCase());
    if (ownerClass) {
      ownerClass.methods.push(method);
    }

    for (const sql of extractSqlStrings(method.body)) {
      sqlBlocks.push({ owner: method.owner, method: method.name, text: sql });
    }
  }

  const procedures = methods
    .filter((method) => method.kind === 'procedure' && !method.owner)
    .map(({ name, parameters, body }) => ({ name, parameters, body }));

  const functions = methods
    .filter((method) => method.kind === 'function' && !method.owner)
    .map(({ name, parameters, body }) => ({ name, parameters, body }));

  if (unitName === 'unknown') warnings.push('Nome da unit não identificado');

  return { name: unitName, uses, classes, procedures, functions, sqlBlocks, warnings };
}

function parseUses(content: string): string[] {
  const match = content.match(USES_PATTERN);
  if (!match) return [];

  return match[1]
    .split(',')
    .map((item) => item.replace(/\{.*?\}/g, '').trim())
    .filter(Boolean);
}

function parseClasses(content: string): PasClass[] {
  const classes: PasClass[] = [];
  for (const match of content.matchAll(CLASS_PATTERN)) {
    classes.push({ name: match[1], ancestor: match[2]?.trim(), methods: [] });
  }
  return classes;
}

function parseMethods(content: string): PasMethod[] {
  const methods: PasMethod[] = [];

  for (const match of content.matchAll(METHOD_PATTERN)) {
    methods.push({
      kind: match[1].toLowerCase() as 'procedure' | 'function',
      owner: match[2],
      name: match[3],
      parameters: match[4]?.trim() ?? '',
      body: match[6]?.trim() ?? ''
    });
  }

  return methods;
}

function extractSqlStrings(body: string): string[] {
  const sql: string[] = [];
  for (const match of body.matchAll(SQL_STRING_PATTERN)) {
    sql.push(match[1].replace(/''/g, "'"));
  }
  return sql;
}
