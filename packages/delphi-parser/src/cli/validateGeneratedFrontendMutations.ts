import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface CheckResult { name: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-mutations arquivo.dfm arquivo.pas entidade [tabela] [--json]');
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

  check('create-hook', content.includes(`const create = useCreate${entity}();`), `pagina deve inicializar useCreate${entity}`);
  check('update-hook', content.includes(`const update = useUpdate${entity}();`), `pagina deve inicializar useUpdate${entity}`);
  check('remove-hook', content.includes(`const remove = useRemove${entity}();`), `pagina deve inicializar useRemove${entity}`);
  check('create-mutate', content.includes('create.mutate(input,'), 'criacao deve executar create.mutate com o input do formulario');
  check('update-mutate', content.includes('update.mutate({ id: editing.id, input },'), 'alteracao deve enviar id e input para update.mutate');
  check('remove-mutate', content.includes('remove.mutate(removing.id,'), 'exclusao deve enviar o identificador para remove.mutate');
  check('create-success', content.includes('onSuccess: () => setIsCreating(false)'), 'dialog de criacao deve fechar somente apos sucesso');
  check('update-success', content.includes('onSuccess: () => setEditing(null)'), 'dialog de alteracao deve fechar somente apos sucesso');
  check('remove-success', content.includes('onSuccess: () => { setRemoving(null);'), 'dialog de exclusao deve fechar somente apos sucesso');
  check('create-pending', content.includes('isSubmitting={create.isPending}'), 'formulario de criacao deve refletir create.isPending');
  check('update-pending', content.includes('isSubmitting={update.isPending}'), 'formulario de alteracao deve refletir update.isPending');
  check('remove-pending', content.includes('disabled={remove.isPending}'), 'confirmacao de exclusao deve bloquear durante remove.isPending');
  check('no-fire-and-forget', !/\b(create|update|remove)\.mutate\([^,\n]+\);/.test(content), 'mutacoes nao devem ser disparadas sem callbacks de ciclo de vida');
  check('selected-cleanup', content.includes('if (selected?.id === removing.id) setSelected(null);'), 'exclusao deve limpar a selecao quando remover o registro selecionado');
}

const passed = checks.filter((item) => item.ok).length;
const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_MUTATIONS_OK:${entity}:checks=${checks.length}:passed=${passed}` : null;
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
