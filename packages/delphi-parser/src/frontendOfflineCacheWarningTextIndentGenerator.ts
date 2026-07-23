import {
  generateFrontendFiles as generateOfflineCacheWarningWordSpacingFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningWordSpacingGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningWordSpacingFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningTextIndent(file.content) };
  });
}

function addOfflineCacheWarningTextIndent(source: string): string {
  return source.replace(
    "        wordSpacing: 'inherit'",
    `        wordSpacing: 'inherit',
        textIndent: 'inherit'`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
