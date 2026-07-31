import {
  generateFrontendFiles as generateOfflineCacheWarningKeyboardShortcutsFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningKeyboardShortcutsGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningKeyboardShortcutsFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningDisabledState(file.content) };
  });
}

function addOfflineCacheWarningDisabledState(source: string): string {
  return source
    .replace(
      '   aria-keyshortcuts="Enter Space"\n    tabIndex={0}',
      '   aria-keyshortcuts="Enter Space"\n   aria-disabled={!isOfflineCacheOld}\n    tabIndex={isOfflineCacheOld ? 0 : -1}'
    )
    .replace(
      "    onKeyDown={(event) => {\n      if (event.key !== 'Enter' && event.key !== ' ') return;",
      "    onKeyDown={(event) => {\n      if (!isOfflineCacheOld) return;\n      if (event.key !== 'Enter' && event.key !== ' ') return;"
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
