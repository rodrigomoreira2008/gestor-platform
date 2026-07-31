import {
  generateFrontendFiles as generateOfflineCacheWarningRestoreFocusFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningRestoreFocusGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningRestoreFocusFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningDismissFocus(file.content) };
  });
}

function addOfflineCacheWarningDismissFocus(source: string): string {
  return source
    .replace(
      '  const offlineCacheWarningAlertRef = useRef<HTMLDivElement | null>(null);',
      `  const offlineCacheWarningAlertRef = useRef<HTMLDivElement | null>(null);
  const offlineCacheWarningChipRef = useRef<HTMLDivElement | null>(null);`
    )
    .replace(
      '            setOfflineCacheWarningDismissed(true);',
      `            setOfflineCacheWarningDismissed(true);
            window.requestAnimationFrame(() => {
              offlineCacheWarningChipRef.current?.focus();
            });`
    )
    .replace(
      'title={totalRecords > 0 ? `${isOfflineCacheOld && isOfflineCacheWarningDismissed ? "Clique para mostrar novamente o alerta. " : ""}Última sincronização: ${offlineCacheUpdatedAtLabel}` : undefined}',
      'ref={offlineCacheWarningChipRef}\n   title={totalRecords > 0 ? `${isOfflineCacheOld && isOfflineCacheWarningDismissed ? "Clique para mostrar novamente o alerta. " : ""}Última sincronização: ${offlineCacheUpdatedAtLabel}` : undefined}'
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
