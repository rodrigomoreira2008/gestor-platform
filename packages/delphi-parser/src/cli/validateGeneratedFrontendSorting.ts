import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-sorting arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const columnsFile = generated.find((file) => file.path.endsWith(`/table/${entityCamel}Columns.ts`));
const page = pageFile?.content ?? '';
const columns = columnsFile?.content ?? '';

const checks: Check[] = [
  { name: 'page-file', ok: Boolean(pageFile), detail: pageFile?.path ?? 'pagina nao gerada' },
  { name: 'columns-file', ok: Boolean(columnsFile), detail: columnsFile?.path ?? 'arquivo de colunas nao gerado' },
  { name: 'typed-columns', ok: columns.includes(`GridColDef<${entityPascal}>[]`), detail: 'colecao de colunas deve manter tipagem da entidade' },
  { name: 'id-column', ok: columns.includes("field: 'id'") && columns.includes("headerName: 'ID'"), detail: 'coluna ID deve existir como chave ordenavel estavel' },
  { name: 'data-columns', ok: resolved.fields.filter((field) => field.name.toLowerCase() !== 'id').slice(0, 8).every((field) => columns.includes(`field: '${toCamelCase(field.name)}'`)), detail: 'campos principais devem estar presentes na configuracao de colunas' },
  { name: 'no-global-sort-disable', ok: !page.includes('disableColumnSorting'), detail: 'ordenacao global do DataGrid nao deve estar desabilitada' },
  { name: 'action-column', ok: page.includes("field: 'actions'") && page.includes("headerName: 'Ações'"), detail: 'coluna de acoes deve existir' },
  { name: 'action-not-sortable', ok: /field:\s*'actions'[\s\S]{0,180}sortable:\s*false/.test(page), detail: 'coluna de acoes deve declarar sortable: false' },
  { name: 'action-not-filterable', ok: /field:\s*'actions'[\s\S]{0,220}filterable:\s*false/.test(page), detail: 'coluna de acoes deve declarar filterable: false' },
  { name: 'memoized-columns', ok: page.includes(`useMemo<GridColDef<${entityPascal}>[]>`) && page.includes(`...${entityCamel}Columns`), detail: 'colunas devem ser compostas de forma memoizada' },
  { name: 'grid-columns-binding', ok: page.includes('<DataGrid') && page.includes('columns={columns}'), detail: 'DataGrid deve receber a configuracao memoizada' },
  { name: 'uncontrolled-sort-model', ok: !page.includes('sortModel={') && !page.includes('onSortModelChange='), detail: 'ordenacao local padrao nao deve ser presa a estado incompleto' }
];

const failed = checks.filter((check) => !check.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_SORTING_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
const output = {
  ok: failed.length === 0,
  entity,
  pageFile: pageFile?.path ?? null,
  columnsFile: columnsFile?.path ?? null,
  checks,
  failed: failed.map((check) => check.name),
  runtimeMarker
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao de ordenacao do frontend gerado de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);

function toCamelCase(value: string): string {
  const parts = value.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return value;
  return parts[0].charAt(0).toLowerCase() + parts[0].slice(1) + parts.slice(1).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
