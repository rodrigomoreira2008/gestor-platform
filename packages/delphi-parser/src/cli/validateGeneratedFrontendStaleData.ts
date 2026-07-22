import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveDelphiForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendStaleDataGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((arg) => arg !== '--json');
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendStaleData.ts <dfm> <pas> <entidade> <tabela> [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const entityPascal = toPascalCase(entity);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = page?.content ?? '';

const checks = [
  ['page generated', Boolean(page)],
  ['Chip imported', source.includes('Button, Chip, Dialog')],
  ['stale state used', source.includes('list.isStale')],
  ['fetching excluded', source.includes('list.isStale && !list.isFetching')],
  ['empty data excluded', source.includes('totalRecords > 0')],
  ['cache label rendered', source.includes('label="Dados em cache"')],
  ['warning style rendered', source.includes('color="warning"') && source.includes('variant="outlined"')],
  ['accessible stale label', source.includes('aria-label="A listagem pode estar desatualizada"')],
  ['background progress preserved', source.includes('aria-label="Atualizando listagem"')],
  ['manual refresh preserved', source.includes("list.isFetching ? 'Atualizando...' : 'Atualizar'"))
] as const;

const failed = checks.filter(([, ok]) => !ok);
const report = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name), ok: failed.length === 0 };

if (json) console.log(JSON.stringify(report, null, 2));
else if (report.ok) console.log(`FRONTEND_STALE_DATA_OK:${entity}:checks=${report.checks}:passed=${report.passed}`);
else console.error(`FRONTEND_STALE_DATA_ERROR:${entity}:failed=${report.failed.join(',')}`);

if (!report.ok) process.exit(1);

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
