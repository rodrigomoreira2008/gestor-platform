import type { ResolvedField, ResolvedForm } from './resolvedForm';

export interface FrontendGeneratedFile {
  path: string;
  content: string;
}

export interface FrontendGeneratorOptions {
  outputRoot?: string;
}

export function generateFrontendFiles(resolved: ResolvedForm, options: FrontendGeneratorOptions = {}): FrontendGeneratedFile[] {
  const entity = toCamelCase(resolved.form.entity);
  const entityPascal = toPascalCase(resolved.form.entity);
  const plural = toKebabPlural(entity);
  const outputRoot = options.outputRoot ?? `apps/frontend/src/modules/${plural}`;

  return [
    { path: `${outputRoot}/types/${entity}.ts`, content: generateTypes(entityPascal, resolved.fields) },
    { path: `${outputRoot}/api/index.ts`, content: generateApi(entityPascal, entity, plural) },
    { path: `${outputRoot}/hooks/index.ts`, content: generateHooks(entityPascal, entity, plural) },
    { path: `${outputRoot}/schema/${entity}Schema.ts`, content: generateSchema(entityPascal, entity, resolved.fields) },
    { path: `${outputRoot}/components/${entityPascal}Form.tsx`, content: generateForm(entityPascal, entity, resolved.fields) },
    { path: `${outputRoot}/table/${entity}Columns.ts`, content: generateColumns(entityPascal, entity, resolved.fields) },
    { path: `${outputRoot}/pages/${entityPascal}Page.tsx`, content: generatePage(entityPascal, entity, plural) },
    { path: `${outputRoot}/Generated/${entityPascal}Route.tsx.txt`, content: generateRouteSnippet(entityPascal, plural) },
    { path: `${outputRoot}/Generated/${entityPascal}MenuItem.ts.txt`, content: generateMenuSnippet(entityPascal, plural) }
  ];
}

function generateTypes(entityPascal: string, fields: ResolvedField[]): string {
  const properties = fields.map((field) => `  ${toCamelCase(field.name)}?: ${mapTsType(field)};`).join('\n');
  return `export interface ${entityPascal} {
  id: number;
${properties}
}

export type ${entityPascal}Input = Omit<${entityPascal}, 'id'>;
`;
}

function generateApi(entityPascal: string, entity: string, plural: string): string {
  return `import { createCrudApi } from '../../../shared/crud/crudApiFactory';
import type { ${entityPascal}, ${entityPascal}Input } from '../types/${entity}';

const api = createCrudApi<${entityPascal}, ${entityPascal}Input>('/api/${plural}');

export const get${entityPascal}s = api.getAll;
export const get${entityPascal} = api.getById;
export const create${entityPascal} = api.create;
export const update${entityPascal} = api.update;
export const remove${entityPascal} = api.remove;
export const ${entity}ResourceApi = api;
`;
}

function generateHooks(entityPascal: string, entity: string, plural: string): string {
  return `import { useCrudResource } from '../../../shared/crud/useCrudResource';
import { ${entity}ResourceApi } from '../api';
import type { ${entityPascal}, ${entityPascal}Input } from '../types/${entity}';

function use${entityPascal}Resource() {
  return useCrudResource<${entityPascal}, ${entityPascal}Input>('${plural}', ${entity}ResourceApi);
}

export function use${entityPascal}s() {
  return use${entityPascal}Resource().list;
}

export function useCreate${entityPascal}() {
  return use${entityPascal}Resource().create;
}

export function useUpdate${entityPascal}() {
  return use${entityPascal}Resource().update;
}

export function useRemove${entityPascal}() {
  return use${entityPascal}Resource().remove;
}
`;
}

function generateSchema(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  const shape = fields.map((field) => `  ${toCamelCase(field.name)}: ${zodExpression(field)}`).join(',\n');
  return `import { z } from 'zod';

export const ${entity}Schema = z.object({
${shape}
});

export type ${entityPascal}FormData = z.infer<typeof ${entity}Schema>;
`;
}

function generateForm(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  const initialState = fields.map((field) => `    ${toCamelCase(field.name)}: initialValue?.${toCamelCase(field.name)} ?? ${defaultValue(field)}`).join(',\n');
  const inputs = fields.map((field) => generateInput(field)).join('\n');

  return `import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import type { ${entityPascal}Input } from '../types/${entity}';

interface ${entityPascal}FormProps {
  initialValue?: Partial<${entityPascal}Input>;
  onSubmit: (input: ${entityPascal}Input) => void;
  isSubmitting?: boolean;
}

export function ${entityPascal}Form({ initialValue, onSubmit, isSubmitting }: ${entityPascal}FormProps) {
  const [form, setForm] = useState<${entityPascal}Input>({
${initialState}
  });

  return (
    <Stack spacing={2} component="form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
${inputs}
      <Button type="submit" variant="contained" disabled={isSubmitting}>Salvar</Button>
    </Stack>
  );
}
`;
}

function generateColumns(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  const columns = fields
    .slice(0, 8)
    .map((field) => `  { field: '${toCamelCase(field.name)}', headerName: '${escapeSingleQuote(field.label ?? field.name)}', flex: 1 }`)
    .join(',\n');

  return `import type { GridColDef } from '@mui/x-data-grid';
import type { ${entityPascal} } from '../types/${entity}';

export const ${entity}Columns: GridColDef<${entityPascal}>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
${columns}
];
`;
}

function generatePage(entityPascal: string, entity: string, plural: string): string {
  return `import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { ${entityPascal}Form } from '../components/${entityPascal}Form';
import { useCreate${entityPascal}, useRemove${entityPascal}, use${entityPascal}s, useUpdate${entityPascal} } from '../hooks';
import { ${entity}Columns } from '../table/${entity}Columns';
import type { ${entityPascal} } from '../types/${entity}';

export function ${entityPascal}Page() {
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<${entityPascal} | null>(null);
  const [removing, setRemoving] = useState<${entityPascal} | null>(null);
  const [search, setSearch] = useState('');
  const list = use${entityPascal}s();
  const create = useCreate${entityPascal}();
  const update = useUpdate${entityPascal}();
  const remove = useRemove${entityPascal}();

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const data = list.data ?? [];
    if (!term) return data;
    return data.filter((item) => Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(term)));
  }, [list.data, search]);

  const columns = useMemo<GridColDef<${entityPascal}>[]>(() => [
    ...${entity}Columns,
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" aria-label="Editar" onClick={() => setEditing(row)}><Edit fontSize="small" /></IconButton>
          <IconButton size="small" aria-label="Excluir" color="error" onClick={() => setRemoving(row)}><Delete fontSize="small" /></IconButton>
        </Stack>
      )
    }
  ], []);

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h5">${entityPascal}</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => setIsCreating(true)}>Novo</Button>
      </Box>

      <TextField
        placeholder="Pesquisar..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
      />

      {list.isError && <Alert severity="warning">Não foi possível carregar ${plural}.</Alert>}

      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={list.isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>

      <Dialog open={isCreating} onClose={() => setIsCreating(false)} fullWidth maxWidth="md">
        <DialogTitle>Novo ${entityPascal}</DialogTitle>
        <DialogContent>
          <${entityPascal}Form
            isSubmitting={create.isPending}
            onSubmit={(input) => create.mutate(input, { onSuccess: () => setIsCreating(false) })}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="md">
        <DialogTitle>Editar ${entityPascal}</DialogTitle>
        <DialogContent>
          {editing && (
            <${entityPascal}Form
              initialValue={editing}
              isSubmitting={update.isPending}
              onSubmit={(input) => update.mutate({ id: editing.id, input }, { onSuccess: () => setEditing(null) })}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(removing)} onClose={() => setRemoving(null)} fullWidth maxWidth="xs">
        <DialogTitle>Excluir ${entityPascal}</DialogTitle>
        <DialogContent>
          <Typography>Confirma a exclusão deste registro?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoving(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={remove.isPending}
            onClick={() => removing && remove.mutate(removing.id, { onSuccess: () => setRemoving(null) })}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
`;
}

function generateRouteSnippet(entityPascal: string, plural: string): string {
  return `// Adicionar ao arquivo de rotas da aplicação
import { ${entityPascal}Page } from '../modules/${plural}/pages/${entityPascal}Page';

{
  path: '/${plural}',
  element: <${entityPascal}Page />
}
`;
}

function generateMenuSnippet(entityPascal: string, plural: string): string {
  return `// Adicionar ao menu lateral ou cadastro principal
{
  label: '${entityPascal}',
  path: '/${plural}'
}
`;
}

function generateInput(field: ResolvedField): string {
  const name = toCamelCase(field.name);
  const label = escapeTsx(field.label ?? field.name);
  const type = mapTsType(field) === 'number' ? 'number' : 'text';
  return `      <TextField
        label="${label}"
        type="${type}"
        value={form.${name} ?? ''}
        required={${field.required ? 'true' : 'false'}}
        onChange={(event) => setForm((current) => ({ ...current, ${name}: ${type === 'number' ? 'Number(event.target.value)' : 'event.target.value'} }))}
      />`;
}

function zodExpression(field: ResolvedField): string {
  const base = mapTsType(field) === 'number' ? 'z.number()' : 'z.string()';
  if (!field.required) return `${base}.optional()`;
  if (mapTsType(field) === 'number') return base;
  const message = field.validationMessages[0] ?? `${field.label ?? field.name} é obrigatório.`;
  return `${base}.min(1, '${escapeSingleQuote(message)}')`;
}

function defaultValue(field: ResolvedField): string {
  return mapTsType(field) === 'number' ? 'undefined' : "''";
}

function mapTsType(field: ResolvedField): string {
  const normalized = field.name.toLowerCase();
  if (normalized.includes('valor') || normalized.includes('preco') || normalized.includes('total')) return 'number';
  if (normalized.includes('quantidade') || normalized.includes('qtd')) return 'number';
  if (normalized === 'id' || normalized.endsWith('id') || normalized.includes('codigo')) return 'number';
  if (normalized.includes('data')) return 'string';
  return 'string';
}

function toPascalCase(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabPlural(value: string): string {
  const kebab = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}

function escapeTsx(value: string): string {
  return value.replace(/"/g, '&quot;');
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
