import {
  generateFrontendFiles as generateOfflineCacheWarningFocusVisibleFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningFocusVisibleGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningFocusVisibleFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningInteractionFeedback(file.content) };
  });
}

function addOfflineCacheWarningInteractionFeedback(source: string): string {
  return source.replace(
    "    sx={{\n      '&:focus-visible': {",
    `    sx={{
      cursor: isOfflineCacheOld ? 'pointer' : 'default',
      transition: 'box-shadow 120ms ease, transform 120ms ease',
      '&:hover': {
        boxShadow: isOfflineCacheOld ? 1 : 0
      },
      '&:active': {
        transform: isOfflineCacheOld ? 'scale(0.98)' : 'none'
      },
      '&:focus-visible': {`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
