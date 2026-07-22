import {
  generateFrontendFiles as generateOfflineErrorRecoveryFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineErrorRecoveryGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineErrorRecoveryFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addInitialOfflineState(file.content) };
  });
}

function addInitialOfflineState(source: string): string {
  return source.replace(
    '{list.isError && <Alert severity="warning"',
    '{list.fetchStatus === \'paused\' && totalRecords === 0 && <Alert severity="info" role="status">Sem conexão. Os dados serão carregados quando a conexão for restabelecida.</Alert>}\n      {list.isError && list.fetchStatus !== \'paused\' && <Alert severity="warning"'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
