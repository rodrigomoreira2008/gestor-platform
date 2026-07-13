import { mapDelphiComponent } from './componentMapping';
import type { InferredDetailGrid } from './detailGridInference';
import { renderDetailGridComponent, renderFrontendDetailGridDefinitions } from './frontendDetailGridGenerator';
import { renderFrontendDetailHooks } from './frontendDetailHookGenerator';
import { renderFrontendFilterComponent } from './frontendFilterComponentGenerator';
import { renderFrontendFilterDefinitions } from './frontendFilterGenerator';
import { renderLookupAutocompleteComponent } from './frontendLookupComponentGenerator';
import { renderFrontendLookupDefinitions, renderFrontendLookupHooks } from './frontendLookupGenerator';
import { renderFrontendTabDefinitions } from './frontendTabGenerator';
import { renderTabbedFormScaffold } from './frontendTabbedFormGenerator';
import type { ResolvedField, ResolvedForm } from './resolvedForm';

export interface FrontendGeneratedFile { path: string; content: string; }
export interface FrontendGeneratorOptions { outputRoot?: string; }

export function generateFrontendFiles(resolved: ResolvedForm, options: FrontendGeneratorOptions = {}): FrontendGeneratedFile[] {
  const entity = toCamelCase(resolved.form.entity);
  const entityPascal = toPascalCase(resolved.form.entity);
  const plural = toKebabPlural(entity);
  const outputRoot = options.outputRoot ?? `apps/frontend/src/modules/${plural}`;
  const detailGridFiles = resolved.detailGrids.map((grid) => ({
    path: `${outputRoot}/details/${entityPascal}${toPascalCase(grid.name)}DetailGrid.tsx`,
    content: renderDetailGridComponent(entityPascal, entity, grid)
  }));

  return [
    { path: `${outputRoot}/types/${entity}.ts`, content: generateTypes(entityPascal, resolved.fields) },
    { path: `${outputRoot}/api/index.ts`, content: generateApi(entityPascal, entity, plural) },
    { path: `${outputRoot}/hooks/index.ts`, content: generateHooks(entityPascal, entity, plural) },
    { path: `${outputRoot}/schema/${entity}Schema.ts`, content: generateSchema(entityPascal, entity, resolved.fields) },
    { path: `${outputRoot}/filters/${entity}Filters.ts`, content: renderFrontendFilterDefinitions(resolved.fields, `${entity}Filters`) },
    { path: `${outputRoot}/components/${entityPascal}Filters.tsx`, content: renderFrontendFilterComponent(entityPascal, entity, resolved.fields) },
    { path: `${outputRoot}/lookups/${entity}Lookups.ts`, content: renderFrontendLookupDefinitions(resolved.lookups, `${entity}Lookups`) },
    { path: `${outputRoot}/lookups/${entity}LookupHooks.ts`, content: renderFrontendLookupHooks(entity, resolved.lookups) },
    { path: `${outputRoot}/components/${entityPascal}LookupField.tsx`, content: renderLookupAutocompleteComponent(entityPascal, entity, resolved.lookups) },
    { path: `${outputRoot}/details/${entity}DetailGrids.ts`, content: renderFrontendDetailGridDefinitions(resolved.detailGrids, `${entity}DetailGrids`) },
    { path: `${outputRoot}/details/${entity}DetailHooks.ts`, content: renderFrontendDetailHooks(entityPascal, entity, resolved.detailGrids) },
    { path: `${outputRoot}/tabs/${entity}Tabs.ts`, content: renderFrontendTabDefinitions(resolved.tabs, `${entity}Tabs`) },
    { path: `${outputRoot}/components/${entityPascal}Form.tsx`, content: generateForm(entityPascal, entity, resolved.fields) },
    { path: `${outputRoot}/components/${entityPascal}TabbedForm.tsx`, content: renderTabbedFormScaffold({ entityPascal, entity, fields: resolved.fields, tabs: resolved.tabs }) },
    ...detailGridFiles,
    { path: `${outputRoot}/table/${entity}Columns.ts`, content: generateColumns(entityPascal, entity, resolved.fields) },
    { path: `${outputRoot}/pages/${entityPascal}Page.tsx`, content: generatePage(entityPascal, entity, plural, resolved.detailGrids) },
    { path: `${outputRoot}/Generated/${entityPascal}Route.tsx.txt`, content: generateRouteSnippet(entityPascal, plural) },
    { path: `${outputRoot}/Generated/${entityPascal}MenuItem.ts.txt`, content: generateMenuSnippet(entityPascal, plural) }
  ];
}

function generateTypes(entityPascal: string, fields: ResolvedField[]): string {
  return `export interface ${entityPascal} {\n  id: number;\n${fields.map((field) => `  ${toCamelCase(field.name)}?: ${mapTsType(field)};`).join('\n')}\n}\n\nexport type ${entityPascal}Input = Omit<${entityPascal}, 'id'>;\n`;
}

function generateApi(entityPascal: string, entity: string, plural: string): string {
  return `import { createCrudApi } from '../../../shared/crud/crudApiFactory';\nimport type { ${entityPascal}, ${entityPascal}Input } from '../types/${entity}';\n\nconst api = createCrudApi<${entityPascal}, ${entityPascal}Input>('/api/${plural}');\n\nexport const get${entityPascal}s = api.getAll;\nexport const get${entityPascal} = api.getById;\nexport const create${entityPascal} = api.create;\nexport const update${entityPascal} = api.update;\nexport const remove${entityPascal} = api.remove;\nexport const ${entity}ResourceApi = api;\n`;
}

function generateHooks(entityPascal: string, entity: string, plural: string): string {
  return `import { useCrudResource } from '../../../shared/crud/useCrudResource';\nimport { ${entity}ResourceApi } from '../api';\nimport type { ${entityPascal}, ${entityPascal}Input } from '../types/${entity}';\n\nfunction use${entityPascal}Resource() { return useCrudResource<${entityPascal}, ${entityPascal}Input>('${plural}', ${entity}ResourceApi); }\n\nexport function use${entityPascal}s() { return use${entityPascal}Resource().list; }\nexport function useCreate${entityPascal}() { return use${entityPascal}Resource().create; }\nexport function useUpdate${entityPascal}() { return use${entityPascal}Resource().update; }\nexport function useRemove${entityPascal}() { return use${entityPascal}Resource().remove; }\n`;
}

function generateSchema(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  return `import { z } from 'zod';\n\nexport const ${entity}Schema = z.object({\n${fields.map((field) => `  ${toCamelCase(field.name)}: ${zodExpression(field)}`).join(',\n')}\n});\n\nexport type ${entityPascal}FormData = z.infer<typeof ${entity}Schema>;\n`;
}

function generateForm(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  const initialState = fields.map((field) => `    ${toCamelCase(field.name)}: initialValue?.${toCamelCase(field.name)} ?? ${defaultValue(field)}`).join(',\n');
  const inputs = fields.map((field) => generateInput(field)).join('\n');
  return `import { Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField } from '@mui/material';\nimport { useState } from 'react';\nimport type { ${entityPascal}Input } from '../types/${entity}';\n\ninterface ${entityPascal}FormProps { initialValue?: Partial<${entityPascal}Input>; onSubmit: (input: ${entityPascal}Input) => void; isSubmitting?: boolean; }\n\nexport function ${entityPascal}Form({ initialValue, onSubmit, isSubmitting }: ${entityPascal}FormProps) {\n  const [form, setForm] = useState<${entityPascal}Input>({\n${initialState}\n  });\n\n  return (\n    <Stack spacing={2} component="form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>\n${inputs}\n      <Button type="submit" variant="contained" disabled={isSubmitting}>Salvar</Button>\n    </Stack>\n  );\n}\n`;
}

function generateColumns(entityPascal: string, entity: string, fields: ResolvedField[]): string {
  const columns = fields.slice(0, 8).map((field) => `  { field: '${toCamelCase(field.name)}', headerName: '${escapeSingleQuote(field.label ?? field.name)}', flex: 1 }`).join(',\n');
  return `import type { GridColDef } from '@mui/x-data-grid';\nimport type { ${entityPascal} } from '../types/${entity}';\n\nexport const ${entity}Columns: GridColDef<${entityPascal}>[] = [\n  { field: 'id', headerName: 'ID', width: 90 },\n${columns}\n];\n`;
}

function generatePage(entityPascal: string, entity: string, plural: string, detailGrids: InferredDetailGrid[]): string {
  const detailImports = detailGrids.map((grid) => `import { ${entityPascal}${toPascalCase(grid.name)}DetailGrid } from '../details/${entityPascal}${toPascalCase(grid.name)}DetailGrid';`).join('\n');
  const detailHookImports = detailGrids.length > 0 ? `import { ${detailGrids.map((grid) => `use${entityPascal}${toPascalCase(grid.name)}Details`).join(', ')} } from '../details/${entity}DetailHooks';` : '';
  const detailHookCalls = detailGrids.map((grid) => `  const ${toCamelCase(grid.name)}Details = use${entityPascal}${toPascalCase(grid.name)}Details(selected?.id);`).join('\n');
  const detailSections = detailGrids.map((grid) => `        <${entityPascal}${toPascalCase(grid.name)}DetailGrid rows={${toCamelCase(grid.name)}Details.data} isLoading={${toCamelCase(grid.name)}Details.isLoading} error={${toCamelCase(grid.name)}Details.error} />`).join('\n');
  const detailsBlock = detailGrids.length > 0 ? `<Stack spacing={2}><Typography variant="h6">Detalhes</Typography>{!selected && <Typography variant="body2">Selecione um registro para carregar os detalhes.</Typography>}{selected && (<Stack spacing={2}>\n${detailSections}\n      </Stack>)}</Stack>` : '';

  return `import { Add, Delete, Edit, Search } from '@mui/icons-material';\nimport { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';\nimport { DataGrid, type GridColDef } from '@mui/x-data-grid';\nimport { useMemo, useState } from 'react';\nimport { ${entityPascal}Filters, type ${entityPascal}FilterValues } from '../components/${entityPascal}Filters';\nimport { ${entityPascal}TabbedForm } from '../components/${entityPascal}TabbedForm';\n${detailImports}\n${detailHookImports}\nimport { ${entity}Filters } from '../filters/${entity}Filters';\nimport { ${entity}Tabs } from '../tabs/${entity}Tabs';\nimport { useCreate${entityPascal}, useRemove${entityPascal}, use${entityPascal}s, useUpdate${entityPascal} } from '../hooks';\nimport { ${entity}Columns } from '../table/${entity}Columns';\nimport type { ${entityPascal} } from '../types/${entity}';\n\nfunction matchesFilter(item: ${entityPascal}, name: string, value: string | number | boolean | null): boolean {\n  const current = item[name as keyof ${entityPascal}];\n  if (value === null || value === '') return true;\n  if (typeof value === 'boolean') return Boolean(current) === value;\n  if (typeof value === 'number') return Number(current) === value;\n  return String(current ?? '').toLocaleLowerCase('pt-BR').includes(value.toLocaleLowerCase('pt-BR'));\n}\n\nexport function ${entityPascal}Page() {\n  const [isCreating, setIsCreating] = useState(false);\n  const [editing, setEditing] = useState<${entityPascal} | null>(null);\n  const [removing, setRemoving] = useState<${entityPascal} | null>(null);\n  const [selected, setSelected] = useState<${entityPascal} | null>(null);\n  const [search, setSearch] = useState('');\n  const [filters, setFilters] = useState<${entityPascal}FilterValues>({});\n  const list = use${entityPascal}s();\n  const create = useCreate${entityPascal}();\n  const update = useUpdate${entityPascal}();\n  const remove = useRemove${entityPascal}();\n${detailHookCalls}\n  const rows = useMemo(() => {\n    const term = search.trim().toLocaleLowerCase('pt-BR');\n    const data = list.data ?? [];\n    const searchableNames = ${entity}Filters.map((filter) => filter.name as keyof ${entityPascal});\n    return data.filter((item) => {\n      const matchesSearch = !term || searchableNames.some((name) => String(item[name] ?? '').toLocaleLowerCase('pt-BR').includes(term));\n      const matchesAdvanced = Object.entries(filters).every(([name, value]) => matchesFilter(item, name, value));\n      return matchesSearch && matchesAdvanced;\n    });\n  }, [filters, list.data, search]);\n  const columns = useMemo<GridColDef<${entityPascal}>[]>(() => [...${entity}Columns, { field: 'actions', headerName: 'Ações', width: 120, sortable: false, filterable: false, renderCell: ({ row }) => <Stack direction="row" spacing={1}><IconButton size="small" aria-label="Editar" onClick={(event) => { event.stopPropagation(); setEditing(row); }}><Edit fontSize="small" /></IconButton><IconButton size="small" aria-label="Excluir" color="error" onClick={(event) => { event.stopPropagation(); setRemoving(row); }}><Delete fontSize="small" /></IconButton></Stack> }], []);\n  return (<Stack spacing={2}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}><Typography variant="h5">${entityPascal}</Typography><Button startIcon={<Add />} variant="contained" onClick={() => setIsCreating(true)}>Novo</Button></Box><Typography variant="caption">Abas inferidas: {${entity}Tabs.length} · Registros exibidos: {rows.length}</Typography><TextField placeholder="Pesquisar em todos os campos..." value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} /><${entityPascal}Filters value={filters} onChange={setFilters} disabled={list.isLoading} />{list.isError && <Alert severity="warning">Não foi possível carregar ${plural}.</Alert>}<Box sx={{ height: 520 }}><DataGrid rows={rows} columns={columns} loading={list.isLoading} disableRowSelectionOnClick onRowClick={({ row }) => setSelected(row)} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} /></Box>${detailsBlock}<Dialog open={isCreating} onClose={() => setIsCreating(false)} fullWidth maxWidth="md"><DialogTitle>Novo ${entityPascal}</DialogTitle><DialogContent><${entityPascal}TabbedForm isSubmitting={create.isPending} onSubmit={(input) => create.mutate(input, { onSuccess: () => setIsCreating(false) })} /></DialogContent></Dialog><Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="md"><DialogTitle>Editar ${entityPascal}</DialogTitle><DialogContent>{editing && (<${entityPascal}TabbedForm initialValue={editing} isSubmitting={update.isPending} onSubmit={(input) => update.mutate({ id: editing.id, input }, { onSuccess: () => setEditing(null) })} />)}</DialogContent></Dialog><Dialog open={Boolean(removing)} onClose={() => setRemoving(null)} fullWidth maxWidth="xs"><DialogTitle>Excluir ${entityPascal}</DialogTitle><DialogContent><Typography>Confirma a exclusão deste registro?</Typography></DialogContent><DialogActions><Button onClick={() => setRemoving(null)}>Cancelar</Button><Button color="error" variant="contained" disabled={remove.isPending} onClick={() => removing && remove.mutate(removing.id, { onSuccess: () => { setRemoving(null); if (selected?.id === removing.id) setSelected(null); } })}>Excluir</Button></DialogActions></Dialog></Stack>);\n}\n`;
}

function generateRouteSnippet(entityPascal: string, plural: string): string { return `// Adicionar ao arquivo de rotas da aplicação\nimport { ${entityPascal}Page } from '../modules/${plural}/pages/${entityPascal}Page';\n\n{ path: '/${plural}', element: <${entityPascal}Page /> }\n`; }
function generateMenuSnippet(entityPascal: string, plural: string): string { return `// Adicionar ao menu lateral ou cadastro principal\n{ label: '${entityPascal}', path: '/${plural}' }\n`; }

function generateInput(field: ResolvedField): string {
  const name = toCamelCase(field.name); const label = escapeTsx(field.label ?? field.name); const type = mapTsType(field) === 'number' ? 'number' : 'text'; const mapping = mapDelphiComponent(field.source?.componentClass);
  if (mapping.role === 'checkbox') return `      <FormControlLabel label="${label}" control={<Checkbox checked={Boolean(form.${name})} onChange={(event) => setForm((current) => ({ ...current, ${name}: event.target.checked as never }))} />} />`;
  if (mapping.role === 'select') return `      <TextField select label="${label}" value={form.${name} ?? ''} required={${field.required ? 'true' : 'false'}} helperText="Lookup Delphi preparado; revisar lookups gerados." onChange={(event) => setForm((current) => ({ ...current, ${name}: event.target.value }))}><MenuItem value="">Selecione...</MenuItem></TextField>`;
  return `      <TextField label="${label}" type="${mapping.role === 'date' ? 'date' : type}" value={form.${name} ?? ''} required={${field.required ? 'true' : 'false'}} InputLabelProps={${mapping.role === 'date' ? '{ shrink: true }' : 'undefined'}} helperText="Origem Delphi: ${escapeTsx(field.source?.componentClass ?? 'desconhecida')} -> ${mapping.frontendComponent}" onChange={(event) => setForm((current) => ({ ...current, ${name}: ${type === 'number' ? "event.target.value === '' ? undefined : Number(event.target.value)" : 'event.target.value'} }))} />`;
}

function zodExpression(field: ResolvedField): string { const base = mapTsType(field) === 'number' ? 'z.number()' : mapTsType(field) === 'boolean' ? 'z.boolean()' : 'z.string()'; if (!field.required) return `${base}.optional()`; if (mapTsType(field) !== 'string') return base; const message = field.validationMessages[0] ?? `${field.label ?? field.name} é obrigatório.`; return `${base}.min(1, '${escapeSingleQuote(message)}')`; }
function defaultValue(field: ResolvedField): string { const mapping = mapDelphiComponent(field.source?.componentClass); if (mapping.role === 'checkbox') return 'false as never'; return mapTsType(field) === 'number' ? 'undefined' : "''"; }
function mapTsType(field: ResolvedField): string { const normalized = field.name.toLowerCase(); const mapping = mapDelphiComponent(field.source?.componentClass); if (mapping.role === 'checkbox') return 'boolean'; if (normalized.includes('valor') || normalized.includes('preco') || normalized.includes('total') || normalized.includes('quantidade') || normalized.includes('qtd') || normalized === 'id' || normalized.endsWith('id') || normalized.includes('codigo')) return 'number'; return 'string'; }
function toPascalCase(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(''); }
function toCamelCase(value: string): string { const pascal = toPascalCase(value); return pascal.charAt(0).toLowerCase() + pascal.slice(1); }
function toKebabPlural(value: string): string { const kebab = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase(); return kebab.endsWith('s') ? kebab : `${kebab}s`; }
function escapeTsx(value: string): string { return value.replace(/"/g, '&quot;'); }
function escapeSingleQuote(value: string): string { return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
