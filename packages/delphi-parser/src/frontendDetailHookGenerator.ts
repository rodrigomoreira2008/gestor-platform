import type { InferredDetailGrid } from './detailGridInference';

export function renderFrontendDetailHooks(entityPascal: string, entity: string, detailGrids: InferredDetailGrid[]): string {
  const hooks = detailGrids.map((grid) => renderDetailHook(entityPascal, grid)).join('\n\n');

  return `import { useQuery } from '@tanstack/react-query';

interface DetailQueryParams {
  masterId?: string | number;
  relationField?: string;
}

async function fetchDetailRows(endpoint: string, params: DetailQueryParams): Promise<Record<string, unknown>[]> {
  const searchParams = new URLSearchParams();
  if (params.masterId !== undefined && params.masterId !== null) searchParams.set(params.relationField ?? 'masterId', String(params.masterId));

  const url = searchParams.toString() ? `${'${endpoint}'}?${'${searchParams.toString()}'}` : endpoint;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao carregar detalhes.');
  return response.json();
}

${hooks || '// Nenhum grid detalhe inferido nesta entidade.'}
`;
}

function renderDetailHook(entityPascal: string, grid: InferredDetailGrid): string {
  const hookName = `use${entityPascal}${toPascalCase(grid.name)}Details`;
  const endpoint = `/api/${toKebabPlural(grid.dataSource ?? grid.name)}`;
  const relationField = inferRelationField(grid.relationship);

  return `export function ${hookName}(masterId?: string | number) {
  return useQuery({
    queryKey: [${quote(grid.name)}, ${quote(endpoint)}, ${quote(relationField)}, masterId],
    queryFn: () => fetchDetailRows(${quote(endpoint)}, { masterId, relationField: ${quote(relationField)} }),
    enabled: masterId !== undefined && masterId !== null
  });
}`;
}

function inferRelationField(relationship?: string): string {
  if (!relationship) return 'masterId';
  const [source] = relationship.split('->').map((part) => part.trim());
  const column = source.includes('.') ? source.split('.').pop() : source;
  return normalizeParamName(column ?? 'masterId');
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
