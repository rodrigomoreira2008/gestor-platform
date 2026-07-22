import {
  generateFrontendFiles as generateRetryIndicatorFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendRetryIndicatorGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateRetryIndicatorFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineAwareRefresh(file.content) };
  });
}

function addOfflineAwareRefresh(source: string): string {
  return source
    .replace(
      'disabled={list.isFetching}',
      "disabled={list.isFetching || list.fetchStatus === 'paused'}"
    )
    .replace(
      "{list.isFetching ? 'Atualizando...' : 'Atualizar'}",
      "{list.fetchStatus === 'paused' ? 'Sem conexão' : list.isFetching ? 'Atualizando...' : 'Atualizar'}"
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
