import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveDelphiForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheTimestampGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((arg) => arg !== '--json');
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheTimestamp.ts <dfm> <pas> <entidade> <tabela> [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const entityPascal = toPascalCase(entity);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = page?.content ?? '';

const checks = [
  ['page generated', Boolean(page)],
  ['timestamp label declared', source.includes('const offlineCacheUpdatedAtLabel =')],
  ['data updated timestamp used', source.includes('new Date(list.dataUpdatedAt)')],
  ['pt br formatting', source.includes("toLocaleString('pt-BR')")],
  ['fallback label', source.includes('Horário de sincronização indisponível')],
  ['tooltip title', source.includes('title={totalRecords > 0 ? `Última sincronização: ${offlineCacheUpdatedAtLabel}` : undefined}')],
  ['accessible announcement timestamp', source.includes('Última sincronização: ${offlineCacheUpdatedAtLabel}.')],
  ['old cache threshold preserved', source.includes('offlineCacheAgeMinutes >= 30')],
  ['old cache visual label preserved', source.includes('Cache antigo')],
  ['live region preserved', source.includes('aria-live="polite"')]
] as const;

const failed = checks.filter(([, ok]) => !ok);
const report = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name), ok: failed.length === 0 };

if (json) console.log(JSON.stringify(report, null, 2));
else if (report.ok) console.log(`FRONTEND_OFFLINE_CACHE_TIMESTAMP_OK:${entity}:checks=${report.checks}:passed=${report.passed}`);
else console.error(`FRONTEND_OFFLINE_CACHE_TIMESTAMP_ERROR:${entity}:failed=${report.failed.join(',')}`);

if (!report.ok) process.exit(1);

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
