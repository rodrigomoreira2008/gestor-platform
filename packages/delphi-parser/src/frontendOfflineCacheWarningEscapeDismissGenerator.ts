import {
  generateFrontendFiles as generateOfflineCacheWarningDismissFocusFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningDismissFocusGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningDismissFocusFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningEscapeDismiss(file.content) };
  });
}

function addOfflineCacheWarningEscapeDismiss(source: string): string {
  return source.replace(
    '<Alert ref={offlineCacheWarningAlertRef} tabIndex={-1} severity="warning" role="status" onClose={',
    `<Alert
          ref={offlineCacheWarningAlertRef}
          tabIndex={-1}
          severity="warning"
          role="status"
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            setOfflineCacheWarningDismissed(true);
            if (typeof window !== 'undefined' && list.dataUpdatedAt > 0) {
              window.sessionStorage.setItem(offlineCacheWarningStorageKey, String(list.dataUpdatedAt));
              window.requestAnimationFrame(() => {
                offlineCacheWarningChipRef.current?.focus();
              });
            }
          }}
          onClose={`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
