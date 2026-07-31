import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveDelphiForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheRecordCountGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((arg) => arg !== '--json');
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheRecordCount.ts <dfm> <pas> <entidade> <tabela> [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const entityPascal = toPascalCase(entity);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = page?.content ?? '';

const checks = [
  ['page generated', Boolean(page)],
  ['record count in warning', source.includes('{totalRecords} registro{totalRecords === 1 ? "" : "s"} do cache')],
  ['warning mentions stale data', source.includes('podem estar desatualizados')],
  ['warning timestamp preserved', source.includes('Última sincronização: {offlineCacheUpdatedAtLabel}')],
  ['record count in announcement', source.includes('Exibindo ${totalRecords} registro${totalRecords === 1 ? "" : "s"}')],
  ['cached singular plural preserved', source.includes('armazenado${totalRecords === 1 ? "" : "s"} em cache')],
  ['updated singular plural preserved', source.includes('atualizado${totalRecords === 1 ? "" : "s"} ${offlineCacheAgeLabel}')],
  ['old cache warning condition preserved', source.includes("list.fetchStatus === 'paused' && totalRecords > 0 && isOfflineCacheOld")],
  ['cache threshold preserved', source.includes('offlineCacheAgeMinutes >= 30')],
  ['live region preserved', source.includes('aria-live="polite"')]
] as const;

const failed = checks.filter(([, ok]) => !ok);
const report = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name), ok: failed.length === 0 };

if (json) console.log(JSON.stringify(report, null, 2));
else if (report.ok) console.log(`FRONTEND_OFFLINE_CACHE_RECORD_COUNT_OK:${entity}:checks=${report.checks}:passed=${report.passed}`);
else console.error(`FRONTEND_OFFLINE_CACHE_RECORD_COUNT_ERROR:${entity}:failed=${report.failed.join(',')}`);

if (!report.ok) process.exit(1);

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
