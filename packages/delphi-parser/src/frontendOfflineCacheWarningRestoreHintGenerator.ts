import {
  generateFrontendFiles as generateOfflineCacheWarningRestoreFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningRestoreGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningRestoreFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningRestoreHint(file.content) };
  });
}

function addOfflineCacheWarningRestoreHint(source: string): string {
  return source.replace(
    'title={totalRecords > 0 ? `Última sincronização: ${offlineCacheUpdatedAtLabel}` : undefined}',
    'title={totalRecords > 0 ? `${isOfflineCacheOld && isOfflineCacheWarningDismissed ? "Clique para mostrar novamente o alerta. " : ""}Última sincronização: ${offlineCacheUpdatedAtLabel}` : undefined}'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
