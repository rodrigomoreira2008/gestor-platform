import {
  generateFrontendFiles as generateOfflineCacheWarningForcedColorsFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningForcedColorsGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningForcedColorsFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningTouchTarget(file.content) };
  });
}

function addOfflineCacheWarningTouchTarget(source: string): string {
  return source.replace(
    "      '@media (forced-colors: active)': {",
    `      '@media (pointer: coarse)': {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        touchAction: 'manipulation'
      },
      '@media (forced-colors: active)': {`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
