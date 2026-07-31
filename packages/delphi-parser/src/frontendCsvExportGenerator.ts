import {
  generateFrontendFiles as generateBaseFrontendFiles,
  type FrontendGeneratedFile,
  type FrontendGeneratorOptions
} from './frontendGenerator';
import type { ResolvedForm } from './resolvedForm';

export type { FrontendGeneratedFile, FrontendGeneratorOptions } from './frontendGenerator';

export function generateFrontendFiles(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const entity = toCamelCase(resolved.form.entity);
  const entityPascal = toPascalCase(resolved.form.entity);
  const exportFields = [
    { name: 'id', label: 'ID' },
    ...resolved.fields.slice(0, 8).map((field) => ({
      name: toCamelCase(field.name),
      label: field.label ?? field.name
    }))
  ];

  return generateBaseFrontendFiles(resolved, options).map((file) => {
    if (!file.path.endsWith(`/pages/${entityPascal}Page.tsx`)) return file;
    return { ...file, content: addCsvExport(file.content, entity, exportFields) };
  });
}

function addCsvExport(
  source: string,
  entity: string,
  fields: Array<{ name: string; label: string }>
): string {
  const exportFields = fields
    .map((field) => `{ name: '${escapeSingleQuote(field.name)}', label: '${escapeSingleQuote(field.label)}' }`)
    .join(', ');

  const withIcon = source.replace(
    "import { Add, Delete, Edit, Search } from '@mui/icons-material';",
    "import { Add, Delete, Download, Edit, Search } from '@mui/icons-material';"
  );

  const anchor = '  const columns = useMemo<GridColDef<';
  const anchorIndex = withIcon.indexOf(anchor);
  if (anchorIndex < 0) return withIcon;

  const exportBlock = `  const exportFields = [${exportFields}] as const;\n  const exportCsv = () => {\n    const header = exportFields.map((field) => field.label).join(';');\n    const body = rows.map((row) => exportFields.map((field) => {\n      const value = String(row[field.name as keyof typeof row] ?? '').replace(/"/g, '""');\n      return \`"\${value}"\`;\n    }).join(';'));\n    const csv = [header, ...body].join('\\r\\n');\n    const blob = new Blob(['\\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });\n    const url = URL.createObjectURL(blob);\n    const link = document.createElement('a');\n    link.href = url;\n    link.download = '${entity.toLowerCase()}-export.csv';\n    document.body.appendChild(link);\n    link.click();\n    link.remove();\n    URL.revokeObjectURL(url);\n  };\n`;

  const withHandler = `${withIcon.slice(0, anchorIndex)}${exportBlock}${withIcon.slice(anchorIndex)}`;
  return withHandler.replace(
    '<Button startIcon={<Add />} variant="contained" onClick={() => setIsCreating(true)}>Novo</Button></Box>',
    '<Stack direction="row" spacing={1}><Button startIcon={<Download />} variant="outlined" disabled={rows.length === 0 || list.isLoading} onClick={exportCsv}>Exportar CSV</Button><Button startIcon={<Add />} variant="contained" onClick={() => setIsCreating(true)}>Novo</Button></Stack></Box>'
  );
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
