import {
  generateFrontendFiles as generateBackgroundLoadingFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendBackgroundLoadingGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateBackgroundLoadingFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addStaleDataIndicator(file.content) };
  });
}

function addStaleDataIndicator(source: string): string {
  const withImport = source.replace(
    "import { Alert, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, LinearProgress, Stack, TextField, Typography } from '@mui/material';",
    "import { Alert, Badge, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, LinearProgress, Stack, TextField, Typography } from '@mui/material';"
  );

  return withImport.replace(
    '{list.isFetching && !list.isLoading && <LinearProgress aria-label="Atualizando listagem" />}',
    '{list.isStale && !list.isFetching && totalRecords > 0 && <Chip size="small" color="warning" variant="outlined" label="Dados em cache" aria-label="A listagem pode estar desatualizada" />}\n      {list.isFetching && !list.isLoading && <LinearProgress aria-label="Atualizando listagem" />}'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
