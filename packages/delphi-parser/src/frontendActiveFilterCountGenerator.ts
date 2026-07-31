import {
  generateFrontendFiles as generateErrorRecoveryFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendErrorRecoveryGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateErrorRecoveryFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addActiveFilterCount(file.content) };
  });
}

function addActiveFilterCount(source: string): string {
  const withImport = source.replace(
    'import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, Typography } from \'@mui/material\';',
    'import { Alert, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, Typography } from \'@mui/material\';'
  );

  const hasActiveFiltersLine = "  const hasActiveFilters = search.trim().length > 0 || Object.values(filters).some((value) => value !== null && value !== '');\n";
  const activeFilterCountBlock = `${hasActiveFiltersLine}  const activeFilterCount = (search.trim().length > 0 ? 1 : 0) + Object.values(filters).filter((value) => value !== null && value !== '').length;\n`;
  const withCount = withImport.replace(hasActiveFiltersLine, activeFilterCountBlock);

  return withCount.replace(
    '<Button startIcon={<FilterAltOff />} variant="text" disabled={!hasActiveFilters || list.isLoading} onClick={clearFilters}>Limpar filtros</Button>',
    '<Badge badgeContent={activeFilterCount} color="primary" invisible={activeFilterCount === 0}><Button startIcon={<FilterAltOff />} variant="text" disabled={!hasActiveFilters || list.isLoading} onClick={clearFilters}>Limpar filtros</Button></Badge>'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
