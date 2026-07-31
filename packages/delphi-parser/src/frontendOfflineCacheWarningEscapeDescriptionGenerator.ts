import {
  generateFrontendFiles as generateOfflineCacheWarningEscapeShortcutFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningEscapeShortcutGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningEscapeShortcutFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningEscapeDescription(file.content) };
  });
}

function addOfflineCacheWarningEscapeDescription(source: string): string {
  return source
    .replace(
      '          aria-keyshortcuts="Escape"\n          onKeyDown={(event) => {',
      '          aria-keyshortcuts="Escape"\n          aria-describedby="offline-cache-warning-shortcut-description"\n          onKeyDown={(event) => {'
    )
    .replace(
      '          Os dados exibidos estão desatualizados. Última sincronização: {offlineCacheUpdatedAtLabel}.',
      `          <span
            id="offline-cache-warning-shortcut-description"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0
            }}
          >
            Pressione Escape para dispensar este alerta.
          </span>
          Os dados exibidos estão desatualizados. Última sincronização: {offlineCacheUpdatedAtLabel}.`
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
