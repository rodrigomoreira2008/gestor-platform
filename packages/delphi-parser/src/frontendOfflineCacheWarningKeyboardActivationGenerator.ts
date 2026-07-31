import {
  generateFrontendFiles as generateOfflineCacheWarningButtonRoleFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningButtonRoleGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningButtonRoleFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningKeyboardActivation(file.content) };
  });
}

function addOfflineCacheWarningKeyboardActivation(source: string): string {
  return source.replace(
    '   role="button"\n    aria-description={',
    `   role="button"
   tabIndex={0}
   onKeyDown={(event) => {
     if (event.key !== 'Enter' && event.key !== ' ') return;
     event.preventDefault();
     event.currentTarget.click();
   }}
    aria-description={`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
