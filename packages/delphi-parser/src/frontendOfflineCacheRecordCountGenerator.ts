import {
  generateFrontendFiles as generateOfflineCacheWarningFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheRecordCount(file.content) };
  });
}

function addOfflineCacheRecordCount(source: string): string {
  return source
    .replace(
      'Os dados exibidos estão desatualizados. Última sincronização: {offlineCacheUpdatedAtLabel}.',
      '{totalRecords} registro{totalRecords === 1 ? "" : "s"} do cache estão sendo exibidos e podem estar desatualizados. Última sincronização: {offlineCacheUpdatedAtLabel}.'
    )
    .replace(
      'Exibindo dados armazenados em cache, atualizados ${offlineCacheAgeLabel}. Última sincronização:',
      'Exibindo ${totalRecords} registro${totalRecords === 1 ? "" : "s"} armazenado${totalRecords === 1 ? "" : "s"} em cache, atualizado${totalRecords === 1 ? "" : "s"} ${offlineCacheAgeLabel}. Última sincronização:'
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
