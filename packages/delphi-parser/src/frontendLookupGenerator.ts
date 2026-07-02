import type { InferredLookup } from './lookupInference';

export function renderFrontendLookupDefinitions(lookups: InferredLookup[], exportName = 'lookups'): string {
  const entries = lookups
    .map((lookup) => `  {
    fieldName: '${escapeSingleQuote(lookup.fieldName)}',
    componentName: ${lookup.componentName ? `'${escapeSingleQuote(lookup.componentName)}'` : 'undefined'},
    endpoint: '${toLookupEndpoint(lookup)}',
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
  raw: unknown;
}

async function fetchLookup(endpoint: string, valueField: string, labelField: string): Promise<LookupOption[]> {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('Nao foi possivel carregar lookup.');
  const data = await response.json() as Record<string, unknown>[];
  return data.map((item) => ({ id: item[valueField] as string | number, label: String(item[labelField] ?? item[valueField] ?? ''), raw: item }));
}

${hooks || '// Nenhum lookup inferido.'}

export const ${entity}LookupHooks = { ${hookNames} };
`;
}

function renderLookupHook(entity: string, lookup: InferredLookup, index: number): string {
  const hookName = `use${toPascalCase(lookup.fieldName)}Lookup`;
  return `export function ${hookName}() {
  const lookup = Array.from(${entity}Lookups)[${index}];
  return useQuery({
    queryKey: ['lookup', lookup.fieldName, lookup.endpoint],
    queryFn: () => fetchLookup(lookup.endpoint, lookup.valueField, lookup.labelField)
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
