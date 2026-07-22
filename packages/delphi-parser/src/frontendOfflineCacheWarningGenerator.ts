import {
  generateFrontendFiles as generateOfflineCacheTimestampFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheTimestampGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheTimestampFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarning(file.content) };
  });
}

function addOfflineCacheWarning(source: string): string {
  return source.replace(
    "      {list.fetchStatus === 'paused' && totalRecords === 0 && <Alert severity=\"info\" role=\"status\">",
    `      {list.fetchStatus === 'paused' && totalRecords > 0 && isOfflineCacheOld && (
        <Alert severity="warning" role="status">
          Os dados exibidos estão desatualizados. Última sincronização: {offlineCacheUpdatedAtLabel}.
        </Alert>
      )}
      {list.fetchStatus === 'paused' && totalRecords === 0 && <Alert severity="info" role="status">`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
