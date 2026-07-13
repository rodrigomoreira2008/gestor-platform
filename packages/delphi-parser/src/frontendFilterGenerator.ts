import { mapDelphiComponent } from './componentMapping';
import type { ResolvedField } from './resolvedForm';

export type FrontendFilterKind = 'text' | 'number' | 'date' | 'boolean' | 'lookup';
export type FrontendFilterOperator = 'contains' | 'equals' | 'gte' | 'lte' | 'between';

export interface FrontendFilterDefinition {
  name: string;
  label: string;
  kind: FrontendFilterKind;
  operators: FrontendFilterOperator[];
  sourceField: string;
  required: boolean;
  confidence: 'high' | 'medium';
}

export function generateFrontendFilterDefinitions(fields: ResolvedField[]): FrontendFilterDefinition[] {
  const seen = new Set<string>();

  return fields
    .map((field) => ({ field, name: toCamelCase(field.name) }))
    .filter(({ name }) => {
      const key = normalizeName(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ field, name }) => {
      const kind = inferFilterKind(field);
      return {
        name,
        label: field.label ?? humanize(field.name),
        kind,
        operators: operatorsFor(kind),
        sourceField: field.dataField ?? field.name,
        required: field.required,
        confidence: field.source?.componentClass ? 'high' : 'medium'
      };
    });
}

export function renderFrontendFilterDefinitions(fields: ResolvedField[], exportName = 'filters'): string {
  const entries = generateFrontendFilterDefinitions(fields)
    .map((filter) => `  {
    name: '${escapeSingleQuote(filter.name)}',
    label: '${escapeSingleQuote(filter.label)}',
    kind: '${filter.kind}',
    operators: [${filter.operators.map((operator) => `'${operator}'`).join(', ')}],
    sourceField: '${escapeSingleQuote(filter.sourceField)}',
    required: ${filter.required},
    confidence: '${filter.confidence}'
  }`)
    .join(',\n');

  return `export const ${exportName} = [\n${entries}\n] as const;\n\nexport type ${toPascalCase(exportName)}Name = (typeof ${exportName})[number]['name'];\nexport type ${toPascalCase(exportName)}Definition = (typeof ${exportName})[number];\n`;
}

function inferFilterKind(field: ResolvedField): FrontendFilterKind {
  const mapping = mapDelphiComponent(field.source?.componentClass);
  const normalized = normalizeName(field.name);

  if (mapping.role === 'checkbox') return 'boolean';
  if (mapping.role === 'select') return 'lookup';
  if (mapping.role === 'date' || normalized.includes('data')) return 'date';
  if (
    normalized.includes('valor') ||
    normalized.includes('preco') ||
    normalized.includes('total') ||
    normalized.includes('quantidade') ||
    normalized.includes('qtd') ||
    normalized === 'id' ||
    normalized.endsWith('id') ||
    normalized.includes('codigo')
  ) return 'number';

  return 'text';
}

function operatorsFor(kind: FrontendFilterKind): FrontendFilterOperator[] {
  if (kind === 'text') return ['contains', 'equals'];
  if (kind === 'number' || kind === 'date') return ['equals', 'gte', 'lte', 'between'];
  return ['equals'];
}

function humanize(value: string): string {
  const words = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : value;
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
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
