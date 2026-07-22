import {
  generateFrontendFiles as generateInitialOfflineStateFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendInitialOfflineStateGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateInitialOfflineStateFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCachedDataState(file.content) };
  });
}

function addOfflineCachedDataState(source: string): string {
  return source
    .replace(
      'label="Sem conexão" aria-label="Consulta pausada aguardando conexão"',
      'label={totalRecords > 0 ? "Offline · exibindo cache" : "Sem conexão"} aria-label={totalRecords > 0 ? "Sem conexão. Exibindo dados armazenados em cache" : "Consulta pausada aguardando conexão"}'
    )
    .replace(
      "? 'Consulta pausada aguardando conexão.'",
      "? totalRecords > 0 ? 'Sem conexão. Exibindo dados armazenados em cache.' : 'Consulta pausada aguardando conexão.'"
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
