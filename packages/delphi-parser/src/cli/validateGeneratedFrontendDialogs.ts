import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface CheckResult { name: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-dialogs arquivo.dfm arquivo.pas entidade [tabela] [--json]');
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
  check('dialog-import', /import \{[^}]*Dialog[^}]*\} from '@mui\/material';/.test(content), 'pagina deve importar Dialog do Material UI');
  check('dialog-title-import', content.includes('DialogTitle'), 'pagina deve importar DialogTitle');
  check('dialog-content-import', content.includes('DialogContent'), 'pagina deve importar DialogContent');
  check('dialog-actions-import', content.includes('DialogActions'), 'pagina deve importar DialogActions para confirmacoes');
  check('create-dialog', content.includes('open={isCreating}') && content.includes('onClose={() => setIsCreating(false)}'), 'dialog de criacao deve ser controlado por isCreating');
  check('edit-dialog', content.includes('open={Boolean(editing)}') && content.includes('onClose={() => setEditing(null)}'), 'dialog de edicao deve ser controlado por editing');
  check('remove-dialog', content.includes('open={Boolean(removing)}') && content.includes('onClose={() => setRemoving(null)}'), 'dialog de exclusao deve ser controlado por removing');
  check('create-title', content.includes(`<DialogTitle>Novo ${entity}</DialogTitle>`), 'dialog de criacao deve possuir titulo localizado');
  check('edit-title', content.includes(`<DialogTitle>Editar ${entity}</DialogTitle>`), 'dialog de edicao deve possuir titulo localizado');
  check('remove-title', content.includes(`<DialogTitle>Excluir ${entity}</DialogTitle>`), 'dialog de exclusao deve possuir titulo localizado');
  check('responsive-form-dialogs', (content.match(/fullWidth maxWidth="md"/g) ?? []).length >= 2, 'dialogs de formulario devem usar fullWidth e maxWidth md');
  check('compact-confirmation-dialog', content.includes('fullWidth maxWidth="xs"'), 'dialog de confirmacao deve usar largura compacta');
  check('cancel-action', content.includes('<Button onClick={() => setRemoving(null)}>Cancelar</Button>'), 'confirmacao de exclusao deve possuir acao Cancelar');
  check('destructive-action', content.includes('<Button color="error" variant="contained"'), 'confirmacao de exclusao deve destacar a acao destrutiva');
  check('pending-delete-lock', content.includes('disabled={remove.isPending}'), 'acao de exclusao deve ser bloqueada durante a mutacao');
  check('no-uncontrolled-dialogs', !/<Dialog\s+open(?:\s|=)(?!\{)/.test(content), 'dialogs gerados nao devem usar estado open nao controlado');
}

const passed = checks.filter((item) => item.ok).length;
const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_DIALOGS_OK:${entity}:checks=${checks.length}:passed=${passed}` : null;
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
