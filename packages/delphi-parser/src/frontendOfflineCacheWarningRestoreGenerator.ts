import {
  generateFrontendFiles as generateOfflineCacheWarningSessionDismissFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningSessionDismissGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningSessionDismissFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningRestore(file.content) };
  });
}

function addOfflineCacheWarningRestore(source: string): string {
  return source
    .replace(
      '  const queryStatusMessage =',
      `  const restoreOfflineCacheWarning = () => {
    setOfflineCacheWarningDismissed(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(offlineCacheWarningStorageKey);
    }
  };

  const queryStatusMessage =`
    )
    .replace(
      'title={totalRecords > 0 ? `Última sincronização: ${offlineCacheUpdatedAtLabel}` : undefined}\n   label={totalRecords > 0',
      'title={totalRecords > 0 ? `Última sincronização: ${offlineCacheUpdatedAtLabel}` : undefined}\n   onClick={totalRecords > 0 && isOfflineCacheOld && isOfflineCacheWarningDismissed ? restoreOfflineCacheWarning : undefined}\n   clickable={totalRecords > 0 && isOfflineCacheOld && isOfflineCacheWarningDismissed}\n   aria-label={totalRecords > 0 && isOfflineCacheOld && isOfflineCacheWarningDismissed ? "Mostrar novamente o alerta de cache antigo" : undefined}\n   label={totalRecords > 0'
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
