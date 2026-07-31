import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; details: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-search arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = pageFile?.content ?? '';

const checks: Check[] = [
  { name: 'page-generated', ok: Boolean(pageFile), details: `pages/${entityPascal}Page.tsx` },
  { name: 'search-state', ok: source.includes("const [search, setSearch] = useState('');"), details: 'estado textual controlado' },
  { name: 'search-input', ok: source.includes('value={search}') && source.includes('onChange={(event) => setSearch(event.target.value)}'), details: 'entrada conectada ao estado' },
  { name: 'search-placeholder', ok: source.includes('placeholder="Pesquisar em todos os campos..."'), details: 'placeholder de pesquisa global' },
  { name: 'search-icon', ok: source.includes('startAdornment: <InputAdornment position="start"><Search'), details: 'icone de pesquisa no inicio' },
  { name: 'normalized-term', ok: source.includes("search.trim().toLocaleLowerCase('pt-BR')"), details: 'termo normalizado para pt-BR' },
  { name: 'searchable-fields', ok: source.includes('Filters.map((filter) => filter.name as keyof'), details: 'campos pesquisaveis derivados dos filtros' },
  { name: 'case-insensitive-values', ok: source.includes("String(item[name] ?? '').toLocaleLowerCase('pt-BR').includes(term)"), details: 'comparacao textual sem diferenca de caixa' },
  { name: 'empty-term-fallback', ok: source.includes('const matchesSearch = !term ||'), details: 'termo vazio preserva todos os registros' },
  { name: 'advanced-filter-composition', ok: source.includes('return matchesSearch && matchesAdvanced;'), details: 'pesquisa combinada com filtros avancados' },
  { name: 'memo-dependency', ok: source.includes('}, [filters, list.data, search]);'), details: 'memoizacao reage ao termo de pesquisa' },
  { name: 'filtered-grid-rows', ok: source.includes('<DataGrid rows={rows}'), details: 'grid recebe os registros pesquisados' }
];

const failed = checks.filter((check) => !check.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_SEARCH_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
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
  console.log(`Validacao da pesquisa frontend gerada de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name} - ${check.details}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
