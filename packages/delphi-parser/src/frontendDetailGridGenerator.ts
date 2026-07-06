import type { InferredDetailGrid } from './detailGridInference';

export function renderFrontendDetailGridDefinitions(detailGrids: InferredDetailGrid[], exportName = 'detailGrids'): string {
  const entries = detailGrids
    .map((grid) => `  {
    name: ${quote(grid.name)},
    componentName: ${grid.componentName ? quote(grid.componentName) : 'undefined'},
    dataSource: ${grid.dataSource ? quote(grid.dataSource) : 'undefined'},
    fieldNames: [${grid.fieldNames.map(quote).join(', ')}],
    relationship: ${grid.relationship ? quote(grid.relationship) : 'undefined'},
    confidence: ${quote(grid.confidence)},
    evidence: ${quote(grid.evidence)}
  }`)
    .join(',\n');

  return `export const ${exportName} = [\n${entries}\n] as const;\n`;
}

export function renderDetailGridComponent(entityPascal: string, entity: string, detailGrid: InferredDetailGrid): string {
  const columns = detailGrid.fieldNames.map((fieldName) => `  { field: ${quote(toCamelCase(fieldName))}, headerName: ${quote(fieldName)}, flex: 1 }`).join(',\n');

  return `import { Box, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

interface ${entityPascal}${toPascalCase(detailGrid.name)}DetailGridProps {
  rows?: Record<string, unknown>[];
  isLoading?: boolean;
}

const columns: GridColDef[] = [
${columns || '  { field: \'id\', headerName: \'ID\', width: 90 }'}
];

export function ${entityPascal}${toPascalCase(detailGrid.name)}DetailGrid({ rows = [], isLoading }: ${entityPascal}${toPascalCase(detailGrid.name)}DetailGridProps) {
  return (
    <Box sx={{ height: 360 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>${escapeDoubleQuote(detailGrid.name)}</Typography>
      <DataGrid rows={rows} columns={columns} loading={isLoading} disableRowSelectionOnClick pageSizeOptions={[5, 10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} />
    </Box>
  );
}
`;
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function escapeDoubleQuote(value: string): string {
  return value.replace(/"/g, '&quot;');
}
