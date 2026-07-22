import {
  generateFrontendFiles as generateOfflineCacheWarningScrollMarginFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningScrollMarginGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningScrollMarginFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningTextReflow(file.content) };
  });
}

function addOfflineCacheWarningTextReflow(source: string): string {
  return source.replace(
    "      scrollMarginInline: 8,",
    `      scrollMarginInline: 8,
      maxWidth: '100%',
      height: 'auto',
      whiteSpace: 'normal',
      '& .MuiChip-label': {
        display: 'block',
        overflowWrap: 'anywhere',
        textAlign: 'center'
      },`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
