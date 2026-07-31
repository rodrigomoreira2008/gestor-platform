import {
  generateFrontendFiles as generateOfflineCacheWarningPressedStateFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningPressedStateGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningPressedStateFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningLiveState(file.content) };
  });
}

function addOfflineCacheWarningLiveState(source: string): string {
  return source.replace(
    '   aria-pressed={isOfflineCacheOld && !isOfflineCacheWarningDismissed}\n    aria-label={',
    '   aria-pressed={isOfflineCacheOld && !isOfflineCacheWarningDismissed}\n   aria-live="polite"\n   aria-atomic="true"\n    aria-label={'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
