import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; details: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-refresh arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = pageFile?.content ?? '';

const refreshIndex = source.indexOf('startIcon={<Refresh />}');
const resetIndex = source.indexOf('startIcon={<FilterAltOff />}');
const exportIndex = source.indexOf('startIcon={<Download />}');
const createIndex = source.indexOf('startIcon={<Add />}');

const checks: Check[] = [
  { name: 'page-generated', ok: Boolean(pageFile), details: `pages/${entityPascal}Page.tsx` },
  { name: 'refresh-icon-import', ok: source.includes('FilterAltOff, Refresh, Search'), details: 'icone Refresh deve ser importado' },
  { name: 'refresh-action', ok: refreshIndex >= 0, details: 'toolbar deve oferecer acao Atualizar' },
  { name: 'refetch-call', ok: source.includes('onClick={() => void list.refetch()}'), details: 'acao deve executar refetch da consulta' },
  { name: 'fetching-state', ok: source.includes('disabled={list.isFetching}'), details: 'acao deve bloquear novas atualizacoes em andamento' },
  { name: 'updating-label', ok: source.includes("list.isFetching ? 'Atualizando...' : 'Atualizar'"), details: 'rotulo deve refletir o estado de atualizacao' },
  { name: 'keeps-current-filters', ok: !source.includes("onClick={() => { setSearch(''); setFilters({}); void list.refetch(); }}"), details: 'atualizacao nao deve limpar pesquisa ou filtros' },
  { name: 'toolbar-order', ok: refreshIndex >= 0 && resetIndex > refreshIndex && exportIndex > resetIndex && createIndex > exportIndex, details: 'ordem deve ser atualizar, limpar, exportar e criar' },
  { name: 'loading-independent', ok: source.includes('disabled={list.isFetching}') && !source.includes('disabled={list.isLoading} onClick={() => void list.refetch()}'), details: 'acao deve observar isFetching, incluindo atualizacoes em segundo plano' },
  { name: 'single-refetch-action', ok: (source.match(/list\.refetch\(\)/g) ?? []).length === 1, details: 'pagina deve possuir uma unica acao explicita de refetch' }
];

const failed = checks.filter((check) => !check.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_REFRESH_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
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
  console.log(`Validacao da atualizacao manual frontend gerada de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name} - ${check.details}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
