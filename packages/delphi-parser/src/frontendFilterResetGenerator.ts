import {
  generateFrontendFiles as generateCsvFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendCsvExportGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entityPascal = toPascalCase(resolved.form.entity);

  return generateCsvFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addFilterReset(file.content) };
  });
}

function addFilterReset(source: string): string {
  const withIcon = source.replace(
    "import { Add, Delete, Download, Edit, Search } from '@mui/icons-material';",
    "import { Add, Delete, Download, Edit, FilterAltOff, Search } from '@mui/icons-material';"
  );

  const anchor = '  const exportFields = [';
  const anchorIndex = withIcon.indexOf(anchor);
  if (anchorIndex < 0) return withIcon;

  const resetBlock = "  const clearFilters = () => { setSearch(''); setFilters({}); };\n";
  const withHandler = `${withIcon.slice(0, anchorIndex)}${resetBlock}${withIcon.slice(anchorIndex)}`;

  return withHandler.replace(
    '<Stack direction="row" spacing={1}><Button startIcon={<Download />} variant="outlined" disabled={rows.length === 0 || list.isLoading} onClick={exportCsv}>Exportar CSV</Button><Button startIcon={<Add />} variant="contained" onClick={() => setIsCreating(true)}>Novo</Button></Stack></Box>',
    '<Stack direction="row" spacing={1}><Button startIcon={<FilterAltOff />} variant="text" disabled={!hasActiveFilters || list.isLoading} onClick={clearFilters}>Limpar filtros</Button><Button startIcon={<Download />} variant="outlined" disabled={rows.length === 0 || list.isLoading} onClick={exportCsv}>Exportar CSV</Button><Button startIcon={<Add />} variant="contained" onClick={() => setIsCreating(true)}>Novo</Button></Stack></Box>'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
