import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-pagination arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));

const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
const source = pageFile?.content ?? '';

function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
}

check('page-file', Boolean(pageFile), `arquivo pages/${entityPascal}Page.tsx deve existir`);
check('data-grid', /<DataGrid\b/.test(source), 'pagina deve renderizar DataGrid');
check('page-size-options', /pageSizeOptions=\{\[10,\s*25,\s*50\]\}/.test(source), 'DataGrid deve oferecer tamanhos 10, 25 e 50');
check('initial-pagination-state', /initialState=\{\{\s*pagination:\s*\{\s*paginationModel:\s*\{\s*pageSize:\s*10\s*\}\s*\}\s*\}\}/.test(source), 'paginacao inicial deve usar pageSize 10');
check('rows-source', /<DataGrid\s+rows=\{rows\}/.test(source), 'DataGrid deve consumir a colecao filtrada rows');
check('stable-columns', /columns=\{columns\}/.test(source), 'DataGrid deve consumir colunas memoizadas');
check('loading-state', /loading=\{list\.isLoading\}/.test(source), 'DataGrid deve refletir o carregamento da consulta');
check('selection-safe', /disableRowSelectionOnClick/.test(source), 'cliques em acoes nao devem alterar selecao implicitamente');
check('row-selection', /onRowClick=\{\(\{ row \}\) => setSelected\(row\)\}/.test(source), 'clique na linha deve atualizar o registro selecionado');
check('visible-count', /Registros exibidos:\s*\{rows\.length\}/.test(source), 'pagina deve informar a quantidade filtrada de registros');
check('client-filter-before-pagination', /const rows = useMemo\(\(\) => \{[\s\S]*return data\.filter\(/.test(source), 'filtros devem produzir rows antes da paginacao visual');
check('no-fixed-page-prop', !/\bpage=\{?\d+\}?/.test(source), 'pagina nao deve fixar indice de pagina estaticamente');

const failed = checks.filter((item) => !item.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_PAGINATION_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
const output = {
  ok: failed.length === 0,
  entity,
  generatedFiles: generated.length,
  pageFile: pageFile?.path ?? null,
  checks,
  runtimeMarker,
  diagnostics: failed.map((item) => `${item.name}: ${item.detail}`)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao da paginacao frontend gerada de ${entity}`);
  console.log(`Arquivo: ${output.pageFile ?? 'nao encontrado'}`);
  for (const item of checks) console.log(`[${item.ok ? 'OK' : 'ERRO'}] ${item.name} - ${item.detail}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
