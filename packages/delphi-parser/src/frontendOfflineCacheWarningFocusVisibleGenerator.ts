import {
  generateFrontendFiles as generateOfflineCacheWarningShortcutAvailabilityFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningShortcutAvailabilityGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningShortcutAvailabilityFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningFocusVisible(file.content) };
  });
}

function addOfflineCacheWarningFocusVisible(source: string): string {
  return source.replace(
    '    tabIndex={isOfflineCacheOld ? 0 : -1}\n    onKeyDown={(event) => {',
    `    tabIndex={isOfflineCacheOld ? 0 : -1}
    sx={{
      '&:focus-visible': {
        outline: '3px solid',
        outlineColor: 'primary.main',
        outlineOffset: '2px'
      }
    }}
    onKeyDown={(event) => {`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
