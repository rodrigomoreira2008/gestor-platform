import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; file: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-resilience arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const page = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const tabbedForm = generated.find((file) => file.path.endsWith(`/components/${entityPascal}TabbedForm.tsx`));
const detailHooks = generated.find((file) => file.path.endsWith(`/details/${entityCamel}DetailHooks.ts`));
const lookupHooks = generated.find((file) => file.path.endsWith(`/lookups/${entityCamel}LookupHooks.ts`));
const checks: Check[] = [];
const diagnostics: string[] = [];

function requirePattern(file: GeneratedFile | undefined, name: string, pattern: RegExp, detail: string): void {
  if (!file) {
    checks.push({ name, file: '(ausente)', ok: false, detail: 'arquivo esperado nao foi gerado' });
    diagnostics.push(`${name}: arquivo esperado nao foi gerado`);
    return;
  }
  const ok = pattern.test(file.content);
  checks.push({ name, file: file.path, ok, detail });
  if (!ok) diagnostics.push(`${file.path}: ${detail}`);
}

requirePattern(page, 'list-loading', /loading=\{list\.isLoading\}/, 'DataGrid deve refletir list.isLoading');
requirePattern(page, 'list-error', /list\.isError\s*&&\s*<Alert/, 'pagina deve renderizar alerta quando a listagem falhar');
requirePattern(page, 'create-pending', /isSubmitting=\{create\.isPending\}/, 'formulario de inclusao deve receber create.isPending');
requirePattern(page, 'update-pending', /isSubmitting=\{update\.isPending\}/, 'formulario de alteracao deve receber update.isPending');
requirePattern(page, 'remove-pending', /disabled=\{remove\.isPending\}/, 'botao de exclusao deve ser bloqueado durante a mutacao');
requirePattern(page, 'mutation-success-close', /onSuccess:\s*\(\)\s*=>\s*setIsCreating\(false\)/, 'inclusao deve fechar o dialogo somente apos sucesso');
requirePattern(page, 'selection-reset-after-delete', /selected\?\.id\s*===\s*removing\.id[^}]*setSelected\(null\)/s, 'exclusao do registro selecionado deve limpar a selecao');
requirePattern(tabbedForm, 'beforeunload', /beforeunload/, 'formulario com alteracoes deve proteger contra descarte acidental');
requirePattern(tabbedForm, 'schema-safe-parse', /safeParse\(/, 'envio deve validar dados sem lancar excecao');
requirePattern(tabbedForm, 'restore-action', /Restaurar/, 'formulario deve oferecer restauracao dos valores');

if (resolved.detailGrids.length > 0) {
  requirePattern(detailHooks, 'detail-abort-signal', /signal/, 'hooks de detalhe devem encaminhar AbortSignal');
  requirePattern(detailHooks, 'detail-retry', /retry:\s*1/, 'hooks de detalhe devem limitar novas tentativas');
  requirePattern(detailHooks, 'detail-enabled', /enabled:/, 'hooks de detalhe devem impedir consulta sem registro mestre');
}

if (resolved.lookups.length > 0) {
  requirePattern(lookupHooks, 'lookup-abort-signal', /signal/, 'hooks de lookup devem encaminhar AbortSignal');
  requirePattern(lookupHooks, 'lookup-retry', /retry:\s*1/, 'hooks de lookup devem limitar novas tentativas');
  requirePattern(lookupHooks, 'lookup-enabled', /enabled/, 'hooks de lookup devem respeitar habilitacao explicita');
}

const passed = checks.filter((check) => check.ok).length;
const marker = diagnostics.length === 0 ? `FRONTEND_RESILIENCE_OK:${entityPascal}:checks=${checks.length}:passed=${passed}` : null;
const report = {
  ok: diagnostics.length === 0,
  entity: entityPascal,
  generatedFiles: generated.length,
  checks: checks.length,
  passed,
  failed: checks.length - passed,
  runtimeMarker: marker,
  results: checks,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  for (const diagnostic of diagnostics) console.error(`- ${diagnostic}`);
  if (marker) console.log(marker);
}

if (!report.ok) process.exit(1);
