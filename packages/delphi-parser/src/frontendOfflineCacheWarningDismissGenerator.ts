import {
  generateFrontendFiles as generateOfflineCacheRecordCountFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheRecordCountGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheRecordCountFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningDismiss(file.content) };
  });
}

function addOfflineCacheWarningDismiss(source: string): string {
  return source
    .replace(
      '  const queryStatusMessage =',
      `  const [isOfflineCacheWarningDismissed, setOfflineCacheWarningDismissed] = useState(false);

  const queryStatusMessage =`
    )
    .replace(
      "list.fetchStatus === 'paused' && totalRecords > 0 && isOfflineCacheOld && (",
      "list.fetchStatus === 'paused' && totalRecords > 0 && isOfflineCacheOld && !isOfflineCacheWarningDismissed && ("
    )
    .replace(
      '<Alert severity="warning" role="status">\n          {totalRecords}',
      '<Alert severity="warning" role="status" onClose={() => setOfflineCacheWarningDismissed(true)}>\n          {totalRecords}'
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
