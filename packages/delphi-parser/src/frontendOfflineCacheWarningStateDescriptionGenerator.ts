import {
  generateFrontendFiles as generateOfflineCacheWarningLiveRelevantFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningLiveRelevantGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningLiveRelevantFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningStateDescription(file.content) };
  });
}

function addOfflineCacheWarningStateDescription(source: string): string {
  return source.replace(
    '   aria-relevant="text"\n    aria-label={',
    `   aria-relevant="text"
   aria-description={
     isOfflineCacheOld
       ? isOfflineCacheWarningDismissed
         ? 'O alerta de dados desatualizados está oculto.'
         : 'O alerta de dados desatualizados está visível.'
       : 'Os dados estão atualizados.'
   }
    aria-label={`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
