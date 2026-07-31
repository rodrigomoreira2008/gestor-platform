import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveDelphiForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendInitialOfflineStateGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((arg) => arg !== '--json');
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendInitialOfflineState.ts <dfm> <pas> <entidade> <tabela> [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const entityPascal = toPascalCase(entity);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = page?.content ?? '';

const checks = [
  ['page generated', Boolean(page)],
  ['paused status checked', source.includes("list.fetchStatus === 'paused' && totalRecords === 0")],
  ['initial offline alert rendered', source.includes('Sem conexão. Os dados serão carregados quando a conexão for restabelecida.')],
  ['informational severity used', source.includes('<Alert severity="info" role="status">')],
  ['generic error suppressed while paused', source.includes("list.isError && list.fetchStatus !== 'paused'" )],
  ['offline recovery button preserved', source.includes("list.fetchStatus === 'paused' ? 'Sem conexão' : list.isFetching ? 'Tentando...' : 'Tentar novamente'" )],
  ['query status announcement preserved', source.includes('aria-live="polite"')],
  ['paused chip preserved', source.includes('label="Sem conexão"')],
  ['background loading preserved', source.includes('aria-label="Atualizando listagem"')],
  ['last updated preserved', source.includes('Última atualização:')]
] as const;

const failed = checks.filter(([, ok]) => !ok);
const report = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name), ok: failed.length === 0 };

if (json) console.log(JSON.stringify(report, null, 2));
else if (report.ok) console.log(`FRONTEND_INITIAL_OFFLINE_STATE_OK:${entity}:checks=${report.checks}:passed=${report.passed}`);
else console.error(`FRONTEND_INITIAL_OFFLINE_STATE_ERROR:${entity}:failed=${report.failed.join(',')}`);

if (!report.ok) process.exit(1);

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
