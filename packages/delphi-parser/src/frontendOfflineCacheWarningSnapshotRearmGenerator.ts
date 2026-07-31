import {
  generateFrontendFiles as generateOfflineCacheWarningRearmFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningRearmGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningRearmFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningSnapshotRearm(file.content) };
  });
}

function addOfflineCacheWarningSnapshotRearm(source: string): string {
  const withRefImport = source.replace(
    "import { useEffect, useMemo, useState } from 'react';",
    "import { useEffect, useMemo, useRef, useState } from 'react';"
  );

  return withRefImport
    .replace(
      '  const [isOfflineCacheWarningDismissed, setOfflineCacheWarningDismissed] = useState(false);',
      `  const [isOfflineCacheWarningDismissed, setOfflineCacheWarningDismissed] = useState(false);
  const previousOfflineCacheUpdatedAtRef = useRef(list.dataUpdatedAt);`
    )
    .replace(
      `  useEffect(() => {
    if (list.fetchStatus !== 'paused') {
      setOfflineCacheWarningDismissed(false);
    }
  }, [list.fetchStatus, list.dataUpdatedAt]);`,
      `  useEffect(() => {
    const cacheSnapshotChanged =
      previousOfflineCacheUpdatedAtRef.current !== list.dataUpdatedAt;

    if (list.fetchStatus !== 'paused' || cacheSnapshotChanged) {
      setOfflineCacheWarningDismissed(false);
    }

    previousOfflineCacheUpdatedAtRef.current = list.dataUpdatedAt;
  }, [list.fetchStatus, list.dataUpdatedAt]);`
    );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
