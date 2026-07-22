import {
  generateFrontendFiles as generateActiveFilterCountFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendActiveFilterCountGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateActiveFilterCountFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addResultCount(file.content) };
  });
}

function addResultCount(source: string): string {
  const rowsAnchor = '  const rows = useMemo(() => {';
  const rowsIndex = source.indexOf(rowsAnchor);
  if (rowsIndex < 0) return source;

  const withTotal = `${source.slice(0, rowsIndex)}  const totalRecords = (list.data ?? []).length;\n${source.slice(rowsIndex)}`;

  return withTotal.replace(
    /Abas inferidas: \{[A-Za-z0-9_]+Tabs\.length\} · Registros exibidos: \{rows\.length\}/,
    (summary) => `${summary} de {totalRecords}`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
