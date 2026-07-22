import {
  generateFrontendFiles as generateOfflineCacheWarningFontKerningFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningFontKerningGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningFontKerningFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningFontLigatures(file.content) };
  });
}

function addOfflineCacheWarningFontLigatures(source: string): string {
  return source.replace(
    "        fontKerning: 'normal'",
    `        fontKerning: 'normal',
        fontVariantLigatures: 'normal'`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
