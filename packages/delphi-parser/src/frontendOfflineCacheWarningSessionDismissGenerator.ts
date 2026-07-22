import {
  generateFrontendFiles as generateOfflineCacheWarningSnapshotRearmFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningSnapshotRearmGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningSnapshotRearmFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningSessionDismiss(file.content, entityPascal) };
  });
}

function addOfflineCacheWarningSessionDismiss(source: string, entityPascal: string): string {
  const storageKey = `gestor:${entityPascal}:offline-cache-warning-dismissed-at`;

  return source
    .replace(
      '  const [isOfflineCacheWarningDismissed, setOfflineCacheWarningDismissed] = useState(false);',
      `  const offlineCacheWarningStorageKey = '${storageKey}';
  const [isOfflineCacheWarningDismissed, setOfflineCacheWarningDismissed] = useState(() => {
    if (typeof window === 'undefined' || list.dataUpdatedAt <= 0) return false;
    return window.sessionStorage.getItem(offlineCacheWarningStorageKey) === String(list.dataUpdatedAt);
  });`
    )
    .replace(
      '      setOfflineCacheWarningDismissed(false);',
      `      setOfflineCacheWarningDismissed(false);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(offlineCacheWarningStorageKey);
      }`
    )
    .replace(
      'onClose={() => setOfflineCacheWarningDismissed(true)}',
      `onClose={() => {
            setOfflineCacheWarningDismissed(true);
            if (typeof window !== 'undefined' && list.dataUpdatedAt > 0) {
              window.sessionStorage.setItem(offlineCacheWarningStorageKey, String(list.dataUpdatedAt));
            }
          }}`
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
