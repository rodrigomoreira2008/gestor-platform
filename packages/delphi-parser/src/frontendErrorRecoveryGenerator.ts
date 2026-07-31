import {
  generateFrontendFiles as generateRefreshFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendRefreshGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateRefreshFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addErrorRecovery(file.content) };
  });
}

function addErrorRecovery(source: string): string {
  return source.replace(
    /\{list\.isError && <Alert severity="warning">([^<]+)<\/Alert>\}/,
    '{list.isError && <Alert severity="warning" action={<Button size="small" disabled={list.isFetching} onClick={() => void list.refetch()}>{list.isFetching ? \'Tentando...\' : \'Tentar novamente\'}</Button>}>$1</Alert>}'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
