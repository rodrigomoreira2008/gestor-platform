import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Check { name: string; ok: boolean; details: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-error-recovery arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = pageFile?.content ?? '';

const checks: Check[] = [
  { name: 'page-generated', ok: Boolean(pageFile), details: `pages/${entityPascal}Page.tsx` },
  { name: 'error-alert', ok: source.includes('list.isError && <Alert severity="warning"'), details: 'falha da listagem deve renderizar alerta' },
  { name: 'alert-action', ok: source.includes('action={<Button size="small"'), details: 'alerta deve oferecer acao de recuperacao' },
  { name: 'retry-label', ok: source.includes("'Tentar novamente'"), details: 'acao deve comunicar nova tentativa' },
  { name: 'retry-refetch', ok: source.includes('onClick={() => void list.refetch()}'), details: 'acao deve solicitar novamente a listagem' },
  { name: 'fetching-lock', ok: source.includes('disabled={list.isFetching}'), details: 'nova tentativa deve bloquear chamadas concorrentes' },
  { name: 'retry-feedback', ok: source.includes("list.isFetching ? 'Tentando...' : 'Tentar novamente'"), details: 'usuario deve receber feedback durante a tentativa' },
  { name: 'message-preserved', ok: source.includes('Não foi possível carregar'), details: 'mensagem contextual de erro deve ser preservada' },
  { name: 'warning-severity', ok: source.includes('<Alert severity="warning"'), details: 'erro recuperavel deve manter severidade de aviso' },
  { name: 'refresh-coexistence', ok: source.includes("list.isFetching ? 'Atualizando...' : 'Atualizar'"), details: 'recuperacao deve coexistir com atualizacao manual' }
];

const failed = checks.filter((check) => !check.ok);
const runtimeMarker = failed.length === 0 ? `FRONTEND_ERROR_RECOVERY_OK:${entity}:checks=${checks.length}:passed=${checks.length}` : null;
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
  console.log(`Validacao da recuperacao de erro frontend gerada de ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name} - ${check.details}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
