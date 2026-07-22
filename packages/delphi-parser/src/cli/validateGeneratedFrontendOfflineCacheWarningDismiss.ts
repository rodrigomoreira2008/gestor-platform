import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveDelphiForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningDismissGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((arg) => arg !== '--json');
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningDismiss.ts <dfm> <pas> <entidade> <tabela> [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const entityPascal = toPascalCase(entity);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = page?.content ?? '';

const checks = [
  ['page generated', Boolean(page)],
  ['dismiss state declared', source.includes('isOfflineCacheWarningDismissed')],
  ['dismiss setter declared', source.includes('setOfflineCacheWarningDismissed')],
  ['dismiss defaults false', source.includes('useState(false)')],
  ['warning condition checks dismissal', source.includes('!isOfflineCacheWarningDismissed')],
  ['warning close action', source.includes('onClose={() => setOfflineCacheWarningDismissed(true)}')],
  ['old cache condition preserved', source.includes('isOfflineCacheOld')],
  ['record count preserved', source.includes('{totalRecords} registro')],
  ['compact cache chip preserved', source.includes('Cache antigo')],
  ['live region preserved', source.includes('aria-live="polite"')]
] as const;

const failed = checks.filter(([, ok]) => !ok);
const report = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name), ok: failed.length === 0 };

if (json) console.log(JSON.stringify(report, null, 2));
else if (report.ok) console.log(`FRONTEND_OFFLINE_CACHE_WARNING_DISMISS_OK:${entity}:checks=${report.checks}:passed=${report.passed}`);
else console.error(`FRONTEND_OFFLINE_CACHE_WARNING_DISMISS_ERROR:${entity}:failed=${report.failed.join(',')}`);

if (!report.ok) process.exit(1);

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
