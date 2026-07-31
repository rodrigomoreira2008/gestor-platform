import {
  generateFrontendFiles as generateOfflineRefreshFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineRefreshGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineRefreshFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addQueryStatusAnnouncement(file.content) };
  });
}

function addQueryStatusAnnouncement(source: string): string {
  const withMessage = source.replace(
    '  return (',
    `  const queryStatusMessage =
    list.fetchStatus === 'paused'
      ? 'Consulta pausada aguardando conexão.'
      : list.failureCount > 0 && list.isFetching
        ? \`Nova tentativa de consulta número \${list.failureCount}.\`
        : list.isFetching && !list.isLoading
          ? 'Atualizando listagem.'
          : list.isStale && totalRecords > 0
            ? 'A listagem pode estar desatualizada.'
            : '';

  return (`
  );

  return withMessage.replace(
    "{list.failureCount > 0 && list.isFetching && list.fetchStatus !== 'paused' && <Chip",
    `<Box
        component="span"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{ position: 'absolute', width: 1, height: 1, p: 0, m: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {queryStatusMessage}
      </Box>
      {list.failureCount > 0 && list.isFetching && list.fetchStatus !== 'paused' && <Chip`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
