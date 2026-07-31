import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningEscapeDismissGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((arg) => arg !== '--json');
const json = process.argv.includes('--json');
if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningEscapeDismiss.ts <arquivo.dfm> <arquivo.pas> <entidade> <tabela> [--json]');
  process.exit(1);
}

const resolved = resolveForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`));
const content = page?.content ?? '';
const checks = [
  ['pagina gerada', Boolean(page)],
  ['evento de teclado', content.includes('onKeyDown={(event) => {')],
  ['tecla Escape', content.includes("event.key !== 'Escape'")],
  ['previne comportamento padrao', content.includes('event.preventDefault();')],
  ['dispensa o alerta', content.includes('setOfflineCacheWarningDismissed(true);')],
  ['persiste o snapshot', content.includes('window.sessionStorage.setItem(offlineCacheWarningStorageKey, String(list.dataUpdatedAt));')],
  ['retorna foco ao chip', content.includes('offlineCacheWarningChipRef.current?.focus();')],
  ['adiamento por frame', content.includes('window.requestAnimationFrame(() => {')],
  ['preserva foco do alerta', content.includes('ref={offlineCacheWarningAlertRef}')],
  ['preserva papel de status', content.includes('role="status"')]
] as const;
const failed = checks.filter(([, ok]) => !ok);
const report = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name), ok: failed.length === 0 };

if (json) console.log(JSON.stringify(report, null, 2));
else if (report.ok) console.log(`FRONTEND_OFFLINE_CACHE_WARNING_ESCAPE_DISMISS_OK:${entity}:checks=${report.checks}:passed=${report.passed}`);
else console.error(`FRONTEND_OFFLINE_CACHE_WARNING_ESCAPE_DISMISS_ERROR:${entity}:failed=${report.failed.join(',')}`);

if (!report.ok) process.exit(1);
