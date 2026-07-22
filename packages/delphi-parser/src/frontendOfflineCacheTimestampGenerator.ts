import {
  generateFrontendFiles as generateOfflineCacheThresholdFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheThresholdGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheThresholdFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheTimestamp(file.content) };
  });
}

function addOfflineCacheTimestamp(source: string): string {
  return source
    .replace(
      '  const queryStatusMessage =',
      `  const offlineCacheUpdatedAtLabel =
    list.dataUpdatedAt > 0
      ? new Date(list.dataUpdatedAt).toLocaleString('pt-BR')
      : 'Horário de sincronização indisponível';

  const queryStatusMessage =`
    )
    .replace(
      'color={totalRecords > 0 && isOfflineCacheOld ? "warning" : "error"}\n   variant="outlined"\n   label={totalRecords > 0',
      'color={totalRecords > 0 && isOfflineCacheOld ? "warning" : "error"}\n   variant="outlined"\n   title={totalRecords > 0 ? `Última sincronização: ${offlineCacheUpdatedAtLabel}` : undefined}\n   label={totalRecords > 0'
    )
    .replace(
      '`${isOfflineCacheOld ? "Cache antigo." : "Sem conexão."} Exibindo dados armazenados em cache, atualizados ${offlineCacheAgeLabel}.`',
      '`${isOfflineCacheOld ? "Cache antigo." : "Sem conexão."} Exibindo dados armazenados em cache, atualizados ${offlineCacheAgeLabel}. Última sincronização: ${offlineCacheUpdatedAtLabel}.`'
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
