import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; details: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-filter-reset arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = pageFile?.content ?? '';

const checks: Check[] = [
  { name: 'page-generated', ok: Boolean(pageFile), details: `pages/${entityPascal}Page.tsx` },
  { name: 'reset-icon-import', ok: source.includes('FilterAltOff'), details: 'icone semantico de limpeza importado' },
  { name: 'reset-handler', ok: source.includes('const clearFilters = () =>'), details: 'handler explicito para restaurar os controles' },
  { name: 'clear-search', ok: source.includes("setSearch('');"), details: 'termo de pesquisa deve ser limpo' },
  { name: 'clear-advanced-filters', ok: source.includes('setFilters({});'), details: 'filtros avancados devem ser restaurados' },
  { name: 'reset-action', ok: source.includes('>Limpar filtros</Button>'), details: 'toolbar deve oferecer acao de limpeza' },
  { name: 'reset-icon', ok: source.includes('startIcon={<FilterAltOff />}'), details: 'acao deve exibir icone de limpeza' },
  { name: 'reset-binding', ok: source.includes('onClick={clearFilters}'), details: 'botao deve executar o handler' },
  { name: 'inactive-disabled', ok: source.includes('disabled={!hasActiveFilters || list.isLoading}'), details: 'acao fica indisponivel sem filtros ativos' },
  { name: 'loading-disabled', ok: source.includes('list.isLoading'), details: 'acao respeita o carregamento da listagem' },
  { name: 'active-state-reuse', ok: source.includes('const hasActiveFilters ='), details: 'estado ativo e compartilhado com o vazio semantico' },
  { name: 'toolbar-order', ok: source.indexOf('>Limpar filtros</Button>') < source.indexOf('>Exportar CSV</Button>') && source.indexOf('>Exportar CSV</Button>') < source.indexOf('>Novo</Button>'), details: 'ordem segue limpar, exportar e criar' }
];

const failed = checks.filter((check) => !check.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_FILTER_RESET_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
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
  console.log(`Validacao da limpeza de filtros frontend gerada de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name} - ${check.details}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
