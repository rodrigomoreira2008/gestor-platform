import type { InferredDetailGrid } from './detailGridInference';

export function renderFrontendDetailGridDefinitions(detailGrids: InferredDetailGrid[], exportName = 'detailGrids'): string {
  const entries = detailGrids
    .map((grid) => `  {
    name: ${quote(grid.name)},
    label: ${quote(grid.label)},
    componentName: ${grid.componentName ? quote(grid.componentName) : 'undefined'},
    dataSource: ${grid.dataSource ? quote(grid.dataSource) : 'undefined'},
    fieldNames: [${grid.fieldNames.map(quote).join(', ')}],
    relationship: ${grid.relationship ? quote(grid.relationship) : 'undefined'},
    masterField: ${grid.masterField ? quote(grid.masterField) : 'undefined'},
    detailField: ${grid.detailField ? quote(grid.detailField) : 'undefined'},
    confidence: ${quote(grid.confidence)},
    evidence: ${quote(grid.evidence)}
  }`)
    .join(',\n');

  return `export const ${exportName} = [\n${entries}\n] as const;\n`;
}

export function renderDetailGridComponent(entityPascal: string, entity: string, detailGrid: InferredDetailGrid): string {
  const columns = detailGrid.fieldNames.map((fieldName) => `  { field: ${quote(toCamelCase(fieldName))}, headerName: ${quote(humanize(fieldName))}, flex: 1, minWidth: 140 }`).join(',\n');
  const componentName = `${entityPascal}${toPascalCase(detailGrid.name)}DetailGrid`;

  return `import { Alert, Box, Stack, Typography } from '@mui/material';
import { DataGrid, GridToolbar, type GridColDef, type GridRowId } from '@mui/x-data-grid';
import { useMemo } from 'react';

interface ${componentName}Props {
  rows?: Record<string, unknown>[];
  isLoading?: boolean;
  error?: unknown;
  height?: number;
}

const columns: GridColDef[] = [
${columns || "  { field: 'id', headerName: 'ID', width: 100 }"}
];

function resolveRowId(row: Record<string, unknown>): GridRowId {
  const candidates = ['id', 'ID', 'Id', 'codigo', 'CODIGO', 'controle', 'CONTROLE'];
  for (const candidate of candidates) {
    const value = row[candidate];
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  return JSON.stringify(row);
}

export function ${componentName}({ rows = [], isLoading, error, height = 380 }: ${componentName}Props) {
  const normalizedRows = useMemo(() => rows.filter(Boolean), [rows]);

  return (
    <Stack spacing={1}>
      <Box>
        <Typography variant="subtitle1">${escapeDoubleQuote(detailGrid.label)}</Typography>
        <Typography variant="caption" color="text.secondary">
          ${escapeDoubleQuote(detailGrid.evidence)}
        </Typography>
      </Box>
      {error && <Alert severity="warning">Nao foi possivel carregar os detalhes.</Alert>}
      <Box sx={{ height, minHeight: 280, width: '100%' }}>
        <DataGrid
          rows={normalizedRows}
          columns={columns}
          loading={isLoading}
          getRowId={resolveRowId}
          disableRowSelectionOnClick
          density="compact"
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          sx={{ '& .MuiDataGrid-cell': { alignItems: 'center' } }}
        />
      </Box>
    </Stack>
  );
}
`;
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function humanize(value: string): string {
  const words = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : value;
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
