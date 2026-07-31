import {
  generateFrontendFiles as generateOfflineCacheWarningDismissFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendOfflineCacheWarningDismissGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateOfflineCacheWarningDismissFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addOfflineCacheWarningRearm(file.content) };
  });
}

function addOfflineCacheWarningRearm(source: string): string {
  const withEffectImport = source
    .replace(
      "import { useMemo, useState } from 'react';",
      "import { useEffect, useMemo, useState } from 'react';"
    )
    .replace(
      "import { useState } from 'react';",
      "import { useEffect, useState } from 'react';"
    );

  return withEffectImport.replace(
    '  const queryStatusMessage =',
    `  useEffect(() => {
    if (list.fetchStatus !== 'paused') {
      setOfflineCacheWarningDismissed(false);
    }
  }, [list.fetchStatus, list.dataUpdatedAt]);

  const queryStatusMessage =`
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
