import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface CheckResult { name: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-state arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`));
const diagnostics: string[] = [];
const checks: CheckResult[] = [];

function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  if (!ok) diagnostics.push(detail);
}

if (!pageFile) {
  diagnostics.push(`pagina ${entity}Page.tsx nao foi gerada`);
} else {
  const content = pageFile.content;
  const stateNames = ['isCreating', 'editing', 'removing', 'selected', 'search', 'filters'];

  check('react-state-import', /import \{[^}]*useState[^}]*\} from 'react';/.test(content), 'pagina deve importar useState do React');
  for (const stateName of stateNames) {
    check(`state-${stateName}`, new RegExp(`const \\[${stateName},\\s*set[A-Z][A-Za-z0-9]*\\] = useState`).test(content), `pagina deve declarar o estado ${stateName}`);
  }
  check('creation-dialog-state', /<Dialog open=\{isCreating\}/.test(content), 'dialogo de criacao deve ser controlado por isCreating');
  check('editing-dialog-state', /<Dialog open=\{Boolean\(editing\)\}/.test(content), 'dialogo de edicao deve ser controlado por editing');
  check('removing-dialog-state', /<Dialog open=\{Boolean\(removing\)\}/.test(content), 'dialogo de exclusao deve ser controlado por removing');
  check('creation-success-reset', /onSuccess: \(\) => setIsCreating\(false\)/.test(content), 'criacao deve fechar o dialogo apos sucesso');
  check('editing-success-reset', /onSuccess: \(\) => setEditing\(null\)/.test(content), 'edicao deve limpar o registro em edicao apos sucesso');
  check('removing-success-reset', /setRemoving\(null\)/.test(content), 'exclusao deve limpar o registro selecionado para remocao');
  check('selected-row-reset', /selected\?\.id === removing\.id\) setSelected\(null\)/.test(content), 'exclusao do item selecionado deve limpar selected');
  check('controlled-search', /value=\{search\} onChange=\{\(event\) => setSearch\(event\.target\.value\)\}/.test(content), 'campo de pesquisa deve ser controlado pelo estado search');
  check('controlled-filters', new RegExp(`<${entity}Filters value=\\{filters\\} onChange=\\{setFilters\\}`).test(content), 'filtros devem ser controlados pelo estado filters');
  check('row-selection', /onRowClick=\{\(\{ row \}\) => setSelected\(row\)\}/.test(content), 'clique na linha deve atualizar selected');
  check('no-global-state', !/(redux|zustand|mobx|recoil)/i.test(content), 'pagina CRUD simples nao deve depender de estado global');
}

const passed = checks.filter((item) => item.ok).length;
const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_STATE_OK:${entity}:checks=${checks.length}:passed=${passed}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  pageFile: pageFile?.path ?? null,
  checks,
  passed,
  failed: checks.length - passed,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(diagnostic);
}

if (!ok) process.exit(1);
