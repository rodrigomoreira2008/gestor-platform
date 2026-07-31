import {
  generateFrontendFiles as generateOfflineCacheWarningReducedMotionFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningReducedMotionGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningReducedMotionFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningForcedColors(file.content) };
  });
}

function addOfflineCacheWarningForcedColors(source: string): string {
  return source.replace(
    "      '&:focus-visible': {",
    `      '@media (forced-colors: active)': {
        border: '1px solid ButtonText',
        color: 'ButtonText',
        forcedColorAdjust: 'auto',
        '&[aria-disabled="true"]': {
          color: 'GrayText',
          borderColor: 'GrayText'
        },
        '&:focus-visible': {
          outlineColor: 'Highlight'
        }
      },
      '&:focus-visible': {`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
