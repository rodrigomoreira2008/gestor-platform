import {
  generateFrontendFiles as generateOfflineCacheWarningControlRelationFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningControlRelationGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningControlRelationFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningActionLabel(file.content) };
  });
}

function addOfflineCacheWarningActionLabel(source: string): string {
  return source.replace(
    '   aria-expanded={isOfflineCacheOld && !isOfflineCacheWarningDismissed}\n   title=',
    `   aria-expanded={isOfflineCacheOld && !isOfflineCacheWarningDismissed}
   aria-label={
     isOfflineCacheOld
       ? isOfflineCacheWarningDismissed
         ? 'Mostrar alerta de dados desatualizados'
         : 'Ocultar alerta de dados desatualizados'
       : \`Última sincronização: \${offlineCacheUpdatedAtLabel}\`
   }
   title=`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
