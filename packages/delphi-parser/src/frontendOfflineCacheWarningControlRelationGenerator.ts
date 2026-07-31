import {
  generateFrontendFiles as generateOfflineCacheWarningEscapeDescriptionFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningEscapeDescriptionGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningEscapeDescriptionFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningControlRelation(file.content) };
  });
}

function addOfflineCacheWarningControlRelation(source: string): string {
  return source
    .replace(
      '<Alert\n          ref={offlineCacheWarningAlertRef}',
      '<Alert\n          id="offline-cache-warning-alert"\n          ref={offlineCacheWarningAlertRef}'
    )
    .replace(
      'ref={offlineCacheWarningChipRef}\n   title=',
      'ref={offlineCacheWarningChipRef}\n   aria-controls="offline-cache-warning-alert"\n   aria-expanded={isOfflineCacheOld && !isOfflineCacheWarningDismissed}\n   title='
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
