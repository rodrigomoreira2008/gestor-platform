import {
  generateFrontendFiles as generateOfflineCacheWarningDisabledStateFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningDisabledStateGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningDisabledStateFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningShortcutAvailability(file.content) };
  });
}

function addOfflineCacheWarningShortcutAvailability(source: string): string {
  return source.replace(
    '   aria-keyshortcuts="Enter Space"\n   aria-disabled={!isOfflineCacheOld}',
    "   aria-keyshortcuts={isOfflineCacheOld ? 'Enter Space' : undefined}\n   aria-disabled={!isOfflineCacheOld}"
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
