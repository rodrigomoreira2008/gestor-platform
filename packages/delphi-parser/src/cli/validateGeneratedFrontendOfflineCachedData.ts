import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveDelphiForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCachedDataGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((arg) => arg !== '--json');
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCachedData.ts <dfm> <pas> <entidade> <tabela> [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const entityPascal = toPascalCase(entity);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = page?.content ?? '';

const checks = [
  ['page generated', Boolean(page)],
  ['cached offline condition', source.includes('totalRecords > 0 ? "Offline · exibindo cache" : "Sem conexão"')],
  ['cached offline accessible label', source.includes('Sem conexão. Exibindo dados armazenados em cache')],
  ['paused status preserved', source.includes("list.fetchStatus === 'paused'")],
  ['initial offline state preserved', source.includes('Os dados serão carregados quando a conexão for restabelecida.')],
  ['initial offline zero records preserved', source.includes("list.fetchStatus === 'paused' && totalRecords === 0")],
  ['cached status announcement', source.includes("totalRecords > 0 ? 'Sem conexão. Exibindo dados armazenados em cache.'")],
  ['live region preserved', source.includes('aria-live="polite"')],
  ['offline refresh preserved', source.includes("list.fetchStatus === 'paused' ? 'Sem conexão' : list.isFetching")],
  ['generic error suppressed while paused', source.includes("list.isError && list.fetchStatus !== 'paused'")]
] as const;

const failed = checks.filter(([, ok]) => !ok);
const report = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name), ok: failed.length === 0 };

if (json) console.log(JSON.stringify(report, null, 2));
else if (report.ok) console.log(`FRONTEND_OFFLINE_CACHED_DATA_OK:${entity}:checks=${report.checks}:passed=${report.passed}`);
else console.error(`FRONTEND_OFFLINE_CACHED_DATA_ERROR:${entity}:failed=${report.failed.join(',')}`);

if (!report.ok) process.exit(1);

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
