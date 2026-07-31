import {
  generateFrontendFiles as generateStaleDataFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendStaleDataGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateStaleDataFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addPausedQueryIndicator(file.content) };
  });
}

function addPausedQueryIndicator(source: string): string {
  return source.replace(
    '{list.isStale && !list.isFetching && totalRecords > 0 && <Chip size="small" color="warning" variant="outlined" label="Dados em cache" aria-label="A listagem pode estar desatualizada" />}',
    '{list.fetchStatus === \'paused\' && <Chip size="small" color="error" variant="outlined" label="Sem conexão" aria-label="Consulta pausada aguardando conexão" />}\n      {list.isStale && list.fetchStatus !== \'paused\' && !list.isFetching && totalRecords > 0 && <Chip size="small" color="warning" variant="outlined" label="Dados em cache" aria-label="A listagem pode estar desatualizada" />}'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
