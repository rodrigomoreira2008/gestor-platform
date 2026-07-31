import {
  generateFrontendFiles as generateOfflineCacheAgeFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheAgeGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheAgeFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheThreshold(file.content) };
  });
}

function addOfflineCacheThreshold(source: string): string {
  const withThreshold = source.replace(
    '  const offlineCacheAgeLabel =',
    `  const isOfflineCacheOld =
    offlineCacheAgeMinutes !== null && offlineCacheAgeMinutes >= 30;
  const offlineCacheAgeLabel =`
  );

  return withThreshold
    .replace(
      'label={totalRecords > 0 ? `Offline · cache ${offlineCacheAgeLabel}` : "Sem conexão"}',
      'label={totalRecords > 0 ? `${isOfflineCacheOld ? "Cache antigo" : "Offline"} · ${offlineCacheAgeLabel}` : "Sem conexão"}'
    )
    .replace(
      'color="error"\n   variant="outlined"\n   label={totalRecords > 0',
      'color={totalRecords > 0 && isOfflineCacheOld ? "warning" : "error"}\n   variant="outlined"\n   label={totalRecords > 0'
    )
    .replace(
      '`Sem conexão. Exibindo dados armazenados em cache, atualizados ${offlineCacheAgeLabel}.`',
      '`${isOfflineCacheOld ? "Cache antigo." : "Sem conexão."} Exibindo dados armazenados em cache, atualizados ${offlineCacheAgeLabel}.`'
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
