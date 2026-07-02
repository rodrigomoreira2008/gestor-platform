import type { ResolvedField } from './resolvedForm';

export type FrontendFilterKind = 'text' | 'number' | 'date';

export interface FrontendFilterDefinition {
  name: string;
  label: string;
  kind: FrontendFilterKind;
}

export function generateFrontendFilterDefinitions(fields: ResolvedField[]): FrontendFilterDefinition[] {
  return fields.map((field) => ({
    name: toCamelCase(field.name),
    label: field.label ?? field.name,
    kind: inferFilterKind(field)
  }));
}

export function renderFrontendFilterDefinitions(fields: ResolvedField[], exportName = 'filters'): string {
  const entries = generateFrontendFilterDefinitions(fields)
    .map((filter) => `  { name: '${escapeSingleQuote(filter.name)}', label: '${escapeSingleQuote(filter.label)}', kind: '${filter.kind}' }`)
    .join(',\n');

  return `export const ${exportName} = [\n${entries}\n] as const;\n`;
}

function inferFilterKind(field: ResolvedField): FrontendFilterKind {
  const normalized = field.name.toLowerCase();
  if (normalized.includes('data')) return 'date';
  if (
    normalized.includes('valor') ||
    normalized.includes('preco') ||
    normalized.includes('total') ||
    normalized.includes('quantidade') ||
    normalized.includes('qtd') ||
    normalized === 'id' ||
    normalized.endsWith('id') ||
    normalized.includes('codigo')
  ) {
    return 'number';
  }
  return 'text';
}

function toPascalCase(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
