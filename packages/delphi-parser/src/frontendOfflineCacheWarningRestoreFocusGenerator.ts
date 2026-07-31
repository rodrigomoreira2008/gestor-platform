import {
  generateFrontendFiles as generateOfflineCacheWarningRestoreHintFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningRestoreHintGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningRestoreHintFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningRestoreFocus(file.content) };
  });
}

function addOfflineCacheWarningRestoreFocus(source: string): string {
  return source
    .replace(
      '  const restoreOfflineCacheWarning = () => {',
      `  const offlineCacheWarningAlertRef = useRef<HTMLDivElement | null>(null);

  const restoreOfflineCacheWarning = () => {`
    )
    .replace(
      '    setOfflineCacheWarningDismissed(false);',
      `    setOfflineCacheWarningDismissed(false);
    window.requestAnimationFrame(() => {
      offlineCacheWarningAlertRef.current?.focus();
    });`
    )
    .replace(
      '<Alert severity="warning" role="status" onClose={',
      '<Alert ref={offlineCacheWarningAlertRef} tabIndex={-1} severity="warning" role="status" onClose={'
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
