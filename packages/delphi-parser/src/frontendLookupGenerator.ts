import type { InferredLookup } from './lookupInference';

export function renderFrontendLookupDefinitions(lookups: InferredLookup[], exportName = 'lookups'): string {
  const entries = lookups
    .map((lookup) => `  {
    fieldName: '${escapeSingleQuote(lookup.fieldName)}',
    componentName: ${lookup.componentName ? `'${escapeSingleQuote(lookup.componentName)}'` : 'undefined'},
    lookupSource: ${lookup.lookupSource ? `'${escapeSingleQuote(lookup.lookupSource)}'` : 'undefined'},
    endpoint: '${escapeSingleQuote(lookup.endpointHint ?? toLookupEndpoint(lookup))}',
    valueField: '${escapeSingleQuote(lookup.keyField ?? 'id')}',
    labelField: '${escapeSingleQuote(lookup.displayField ?? 'descricao')}',
    confidence: '${lookup.confidence}',
    evidence: '${escapeSingleQuote(lookup.evidence)}'
  }`)
    .join(',\n');

  return `export const ${exportName} = [\n${entries}\n] as const;\n`;
}

export function renderFrontendLookupHooks(entity: string, lookups: InferredLookup[]): string {
  const hooks = lookups.map((lookup, index) => renderLookupHook(entity, lookup, index)).join('\n\n');
  const hookNames = lookups.map((lookup) => `use${toPascalCase(lookup.fieldName)}Lookup`).join(', ');

  return `import { useQuery } from '@tanstack/react-query';
import { ${entity}Lookups } from '../lookups/${entity}Lookups';

export interface LookupOption {
  id: string | number;
  label: string;
  raw: Record<string, unknown>;
}

function unwrapLookupData(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  for (const key of ['items', 'data', 'results', 'rows']) {
    if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
  }
  return [];
}

async function fetchLookup(endpoint: string, valueField: string, labelField: string, signal?: AbortSignal): Promise<LookupOption[]> {
  const response = await fetch(endpoint, { signal });
  if (!response.ok) throw new Error(\`Nao foi possivel carregar lookup (\${response.status}).\`);
  const payload = await response.json() as unknown;
  return unwrapLookupData(payload)
    .map((item) => ({
      id: item[valueField] as string | number,
      label: String(item[labelField] ?? item[valueField] ?? ''),
      raw: item
    }))
    .filter((option) => option.id !== undefined && option.id !== null)
    .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'));
}

${hooks || '// Nenhum lookup inferido.'}

export const ${entity}LookupHooks = { ${hookNames} };
`;
}

function renderLookupHook(entity: string, lookup: InferredLookup, index: number): string {
  const hookName = `use${toPascalCase(lookup.fieldName)}Lookup`;
  return `export function ${hookName}(enabled = true) {
  const lookup = Array.from(${entity}Lookups)[${index}];
  return useQuery({
    queryKey: ['lookup', lookup.fieldName, lookup.endpoint, lookup.valueField, lookup.labelField],
    queryFn: ({ signal }) => fetchLookup(lookup.endpoint, lookup.valueField, lookup.labelField, signal),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });
}`;
}

function toLookupEndpoint(lookup: InferredLookup): string {
  const base = lookup.lookupSource ?? lookup.fieldName;
  return `/api/${toKebabPlural(base)}`;
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toKebabPlural(value: string): string {
  const kebab = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
