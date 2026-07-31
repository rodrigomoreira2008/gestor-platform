import {
  generateFrontendFiles as generateOfflineCachedDataFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCachedDataGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCachedDataFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheAge(file.content) };
  });
}

function addOfflineCacheAge(source: string): string {
  return source
    .replace(
      '  const queryStatusMessage =',
      `  const offlineCacheAgeMinutes =
    list.dataUpdatedAt > 0
      ? Math.max(0, Math.floor((Date.now() - list.dataUpdatedAt) / 60_000))
      : null;
  const offlineCacheAgeLabel =
    offlineCacheAgeMinutes === null
      ? 'sem horário'
      : offlineCacheAgeMinutes === 0
        ? 'agora'
        : \`há \${offlineCacheAgeMinutes} min\`;

  const queryStatusMessage =`
    )
    .replace(
      'label={totalRecords > 0 ? "Offline · exibindo cache" : "Sem conexão"}',
      'label={totalRecords > 0 ? `Offline · cache ${offlineCacheAgeLabel}` : "Sem conexão"}'
    )
    .replace(
      "? totalRecords > 0 ? 'Sem conexão. Exibindo dados armazenados em cache.' : 'Consulta pausada aguardando conexão.'",
      "? totalRecords > 0 ? `Sem conexão. Exibindo dados armazenados em cache, atualizados ${offlineCacheAgeLabel}.` : 'Consulta pausada aguardando conexão.'"
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
