import {
  generateFrontendFiles as generateResultCountFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendResultCountGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateResultCountFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addLastUpdatedIndicator(file.content) };
  });
}

function addLastUpdatedIndicator(source: string): string {
  const totalAnchor = '  const totalRecords = (list.data ?? []).length;\n';
  const timestampBlock = `${totalAnchor}  const lastUpdatedAt = list.dataUpdatedAt > 0\n    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(list.dataUpdatedAt))\n    : 'Aguardando dados';\n`;
  const withTimestamp = source.replace(totalAnchor, timestampBlock);

  return withTimestamp.replace(
    /(Abas inferidas: \{[A-Za-z0-9_]+Tabs\.length\} · Registros exibidos: \{rows\.length\} de \{totalRecords\})/,
    '$1 · Última atualização: {lastUpdatedAt}'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
