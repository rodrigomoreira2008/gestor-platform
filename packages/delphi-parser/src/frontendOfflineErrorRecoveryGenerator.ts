import {
  generateFrontendFiles as generateQueryStatusAnnouncementFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendQueryStatusAnnouncementGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateQueryStatusAnnouncementFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineAwareErrorRecovery(file.content) };
  });
}

function addOfflineAwareErrorRecovery(source: string): string {
  return source
    .replace(
      'disabled={list.isFetching} onClick={() => void list.refetch()}',
      "disabled={list.isFetching || list.fetchStatus === 'paused'} onClick={() => void list.refetch()}"
    )
    .replace(
      "{list.isFetching ? 'Tentando...' : 'Tentar novamente'}",
      "{list.fetchStatus === 'paused' ? 'Sem conexão' : list.isFetching ? 'Tentando...' : 'Tentar novamente'}"
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
