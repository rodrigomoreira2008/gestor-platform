import type { InferredDetailGrid } from './detailGridInference';

export function renderFrontendDetailHooks(entityPascal: string, entity: string, detailGrids: InferredDetailGrid[]): string {
  const hooks = detailGrids.map((grid) => renderDetailHook(entityPascal, grid)).join('\n\n');

  return `import { useQuery } from '@tanstack/react-query';

interface DetailQueryParams {
  masterId?: string | number;
  relationField?: string;
}

function unwrapRows(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== 'object') return [];
  const envelope = payload as Record<string, unknown>;
  for (const key of ['items', 'data', 'results', 'rows']) {
    if (Array.isArray(envelope[key])) return envelope[key] as Record<string, unknown>[];
  }
  return [];
}

async function fetchDetailRows(endpoint: string, params: DetailQueryParams, signal?: AbortSignal): Promise<Record<string, unknown>[]> {
  const searchParams = new URLSearchParams();
  if (params.masterId !== undefined && params.masterId !== null) searchParams.set(params.relationField ?? 'masterId', String(params.masterId));

  const url = searchParams.toString() ? \`${'${endpoint}'}?${'${searchParams.toString()}'}\` : endpoint;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || \`Falha ao carregar detalhes (${ '${response.status}' }).\`);
  }
  return unwrapRows(await response.json());
}

${hooks || '// Nenhum grid detalhe inferido nesta entidade.'}
`;
}

function renderDetailHook(entityPascal: string, grid: InferredDetailGrid): string {
  const hookName = `use${entityPascal}${toPascalCase(grid.name)}Details`;
  const endpoint = `/api/${toKebabPlural(stripDatasetPrefix(grid.dataSource ?? grid.name))}`;
  const relationField = grid.detailField ? normalizeParamName(grid.detailField) : inferRelationField(grid.relationship);

  return `export function ${hookName}(masterId?: string | number) {
  return useQuery({
    queryKey: ['detail', ${quote(grid.name)}, ${quote(endpoint)}, ${quote(relationField)}, masterId],
    queryFn: ({ signal }) => fetchDetailRows(${quote(endpoint)}, { masterId, relationField: ${quote(relationField)} }, signal),
    enabled: masterId !== undefined && masterId !== null,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false
  });
}`;
}

function inferRelationField(relationship?: string): string {
  if (!relationship) return 'masterId';
  const [source] = relationship.split('->').map((part) => part.trim());
  const column = source.includes('.') ? source.split('.').pop() : source;
  return normalizeParamName(column ?? 'masterId');
}

function stripDatasetPrefix(value: string): string {
  return value.replace(/^(?:ds|qry|cds|fdq|ado|tbl|tb)/i, '') || value;
}

function normalizeParamName(value: string): string {
  const pascal = toPascalCase(value);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : 'masterId';
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toKebabPlural(value: string): string {
  const kebab = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}
