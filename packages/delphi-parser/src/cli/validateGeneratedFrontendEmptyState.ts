import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; details: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-empty-state arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = pageFile?.content ?? '';

const checks: Check[] = [
  { name: 'page-generated', ok: Boolean(pageFile), details: `pages/${entityPascal}Page.tsx` },
  { name: 'active-filter-detection', ok: source.includes("const hasActiveFilters = search.trim().length > 0 || Object.values(filters).some((value) => value !== null && value !== '');"), details: 'estado vazio distingue pesquisa ou filtros ativos' },
  { name: 'overlay-component', ok: source.includes('const EmptyRowsOverlay = () =>'), details: 'overlay dedicado para ausencia de linhas' },
  { name: 'centered-layout', ok: source.includes('alignItems="center"') && source.includes('justifyContent="center"') && source.includes("height: '100%'"), details: 'conteudo vazio ocupa e centraliza a area do grid' },
  { name: 'empty-database-message', ok: source.includes("'Nenhum registro cadastrado.'"), details: 'mensagem para base sem registros' },
  { name: 'filtered-empty-message', ok: source.includes("'Nenhum resultado encontrado.'"), details: 'mensagem para pesquisa sem resultados' },
  { name: 'empty-database-guidance', ok: source.includes("'Cadastre o primeiro registro para iniciar.'"), details: 'orientacao para iniciar o cadastro' },
  { name: 'filtered-empty-guidance', ok: source.includes("'Revise a pesquisa ou os filtros aplicados.'"), details: 'orientacao para revisar criterios ativos' },
  { name: 'first-record-action', ok: source.includes('Cadastrar primeiro registro'), details: 'acao contextual para cadastrar o primeiro item' },
  { name: 'first-record-icon', ok: source.includes('startIcon={<Add />}'), details: 'acao contextual usa icone semantico' },
  { name: 'first-record-dialog', ok: source.includes('onClick={() => setIsCreating(true)}>Cadastrar primeiro registro</Button>'), details: 'acao contextual abre o dialogo de inclusao' },
  { name: 'action-only-without-filters', ok: source.includes('{!hasActiveFilters && <Button'), details: 'acao de primeiro cadastro nao aparece em busca vazia' },
  { name: 'grid-slot-binding', ok: source.includes('slots={{ noRowsOverlay: EmptyRowsOverlay }}'), details: 'DataGrid recebe o overlay personalizado' }
];

const failed = checks.filter((check) => !check.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_EMPTY_STATE_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
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
  console.log(`Validacao do estado vazio frontend gerado de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name} - ${check.details}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
