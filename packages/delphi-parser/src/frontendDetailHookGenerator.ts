import type { InferredDetailGrid } from './detailGridInference';

export function renderFrontendDetailHooks(entityPascal: string, entity: string, detailGrids: InferredDetailGrid[]): string {
  const hooks = detailGrids.map((grid) => renderDetailHook(entityPascal, grid)).join('\n\n');

  return `import { useQuery } from '@tanstack/react-query';

async function fetchDetailRows(endpoint: string): Promise<Record<string, unknown>[]> {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('Falha ao carregar detalhes.');
  return response.json();
}

${hooks || '// Nenhum grid detalhe inferido nesta entidade.'}
`;
}

function renderDetailHook(entityPascal: string, grid: InferredDetailGrid): string {
  const hookName = `use${entityPascal}${toPascalCase(grid.name)}Details`;
  const endpoint = `/api/${toKebabPlural(grid.dataSource ?? grid.name)}`;

  return `export function ${hookName}(masterId?: string | number) {
  return useQuery({
    queryKey: [${quote(grid.name)}, masterId],
    queryFn: () => fetchDetailRows(\`${endpoint}?masterId=\${masterId}\`),
    enabled: masterId !== undefined && masterId !== null
  });
}`;
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
