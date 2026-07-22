import {
  generateFrontendFiles as generatePausedQueryFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendPausedQueryGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generatePausedQueryFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addRetryIndicator(file.content) };
  });
}

function addRetryIndicator(source: string): string {
  return source.replace(
    "{list.fetchStatus === 'paused' && <Chip size=\"small\" color=\"error\" variant=\"outlined\" label=\"Sem conexão\" aria-label=\"Consulta pausada aguardando conexão\" />}",
    "{list.failureCount > 0 && list.isFetching && list.fetchStatus !== 'paused' && <Chip size=\"small\" color=\"info\" variant=\"outlined\" label={`Nova tentativa ${list.failureCount}`} aria-label={`Nova tentativa de consulta número ${list.failureCount}`} />}\n      {list.fetchStatus === 'paused' && <Chip size=\"small\" color=\"error\" variant=\"outlined\" label=\"Sem conexão\" aria-label=\"Consulta pausada aguardando conexão\" />}"
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
