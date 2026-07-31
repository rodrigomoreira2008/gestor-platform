import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; details: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-toolbar arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = pageFile?.content ?? '';

const headingIndex = source.indexOf(`<Typography variant="h5">${entityPascal}</Typography>`);
const createIndex = source.indexOf('<Button startIcon={<Add />} variant="contained" onClick={() => setIsCreating(true)}>Novo</Button>');
const counterIndex = source.indexOf('Registros exibidos: {rows.length}');
const searchIndex = source.indexOf('placeholder="Pesquisar em todos os campos..."');
const filtersIndex = source.indexOf(`<${entityPascal}Filters value={filters} onChange={setFilters} disabled={list.isLoading} />`);
const gridIndex = source.indexOf('<DataGrid rows={rows}');

const checks: Check[] = [
  { name: 'page-generated', ok: Boolean(pageFile), details: `pages/${entityPascal}Page.tsx` },
  { name: 'toolbar-layout', ok: source.includes("display: 'flex'") && source.includes("justifyContent: 'space-between'") && source.includes('gap: 2'), details: 'cabecalho usa layout flexivel com espacamento' },
  { name: 'entity-heading', ok: headingIndex >= 0, details: 'titulo identifica a entidade gerada' },
  { name: 'create-action', ok: createIndex >= 0, details: 'acao Novo abre o fluxo de inclusao' },
  { name: 'create-icon', ok: source.includes("import { Add, Delete, Edit, Search } from '@mui/icons-material';") && source.includes('startIcon={<Add />}'), details: 'acao Novo possui icone semantico' },
  { name: 'inferred-tabs-counter', ok: source.includes(`Abas inferidas: {${entity.charAt(0).toLowerCase() + entity.slice(1)}Tabs.length}`), details: 'toolbar informa quantidade de abas inferidas' },
  { name: 'visible-rows-counter', ok: counterIndex >= 0, details: 'toolbar informa quantidade de registros exibidos' },
  { name: 'global-search', ok: searchIndex >= 0, details: 'pesquisa global integra a area de ferramentas' },
  { name: 'advanced-filters', ok: filtersIndex >= 0, details: 'filtros avancados integram a area de ferramentas' },
  { name: 'loading-aware-filters', ok: source.includes('disabled={list.isLoading}'), details: 'filtros ficam indisponiveis durante carregamento' },
  { name: 'toolbar-order', ok: headingIndex >= 0 && createIndex > headingIndex && counterIndex > createIndex && searchIndex > counterIndex && filtersIndex > searchIndex, details: 'hierarquia visual segue titulo, acao, resumo, pesquisa e filtros' },
  { name: 'grid-after-toolbar', ok: gridIndex > filtersIndex && filtersIndex >= 0, details: 'grid recebe os dados depois dos controles da toolbar' }
];

const failed = checks.filter((check) => !check.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_TOOLBAR_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
const output = {
  ok: failed.length === 0,
  entity,
  pageFile: pageFile?.path ?? null,
  checks,
  runtimeMarker,
  diagnostics: failed.map((check) => `${check.name}: ${check.details}`)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao da toolbar frontend gerada de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name} - ${check.details}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
