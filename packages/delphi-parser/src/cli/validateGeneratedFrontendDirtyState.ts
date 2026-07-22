import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface CheckResult { name: string; ok: boolean; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-dirty-state arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const formFile = generated.find((file) => file.path.endsWith(`/components/${entity}TabbedForm.tsx`));
const diagnostics: string[] = [];
const checks: CheckResult[] = [];

function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  if (!ok) diagnostics.push(detail);
}

if (!formFile) {
  diagnostics.push(`formulario ${entity}TabbedForm.tsx nao foi gerado`);
} else {
  const content = formFile.content;
  check('dirty-callback-prop', /onDirtyChange\?: \(dirty: boolean\) => void;/.test(content), 'formulario deve expor callback onDirtyChange tipado');
  check('warning-prop', /warnOnUnsavedChanges\?: boolean;/.test(content), 'formulario deve permitir configurar aviso de alteracoes nao salvas');
  check('warning-default', /warnOnUnsavedChanges = true/.test(content), 'aviso de alteracoes nao salvas deve vir habilitado por padrao');
  check('baseline-ref', /baselineRef = useRef\(serializeForm\(createInitialForm\(initialValue\)\)\)/.test(content), 'formulario deve manter baseline serializada em ref');
  check('dirty-memo', /const isDirty = useMemo\(\(\) => serializeForm\(form\) !== baselineRef\.current, \[form\]\)/.test(content), 'estado dirty deve ser derivado por useMemo');
  check('dirty-callback-effect', /onDirtyChange\?\.\(isDirty\)/.test(content), 'mudancas no dirty state devem ser propagadas ao consumidor');
  check('beforeunload-registration', /window\.addEventListener\('beforeunload', handleBeforeUnload\)/.test(content), 'formulario deve registrar protecao beforeunload');
  check('beforeunload-cleanup', /window\.removeEventListener\('beforeunload', handleBeforeUnload\)/.test(content), 'formulario deve remover listener beforeunload no cleanup');
  check('beforeunload-guard', /if \(!warnOnUnsavedChanges \|\| !isDirty\) return;/.test(content), 'beforeunload deve ser ativado somente quando houver alteracoes');
  check('reset-baseline', /function resetForm\(\)[\s\S]*baselineRef\.current = serializeForm\(nextForm\)/.test(content), 'restauracao deve redefinir baseline');
  check('submit-baseline', /baselineRef\.current = serializeForm\(normalized\)/.test(content), 'submit valido deve atualizar baseline');
  check('dirty-feedback', /Existem alterações não salvas\./.test(content) && /Nenhuma alteração pendente\./.test(content), 'formulario deve exibir feedback visual do dirty state');
  check('restore-disabled', /disabled=\{!isDirty \|\| isSubmitting\}/.test(content), 'botao Restaurar deve respeitar dirty state e submissao');
  check('live-region', /aria-live="polite"/.test(content), 'feedback do dirty state deve ser anunciado por tecnologia assistiva');
}

const passed = checks.filter((item) => item.ok).length;
const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_DIRTY_STATE_OK:${entity}:checks=${checks.length}:passed=${passed}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  formFile: formFile?.path ?? null,
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
