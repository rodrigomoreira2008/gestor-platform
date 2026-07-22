import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveDelphiForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningSessionDismissGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((arg) => arg !== '--json');
const json = process.argv.includes('--json');
if (!dfmPath || !pasPath || !entity || !table) process.exit(1);
const resolved = resolveDelphiForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const entityPascal = toPascalCase(entity);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const source = page?.content ?? '';
const checks = [
  ['page generated', Boolean(page)],
  ['session storage used', source.includes('window.sessionStorage')],
  ['storage key declared', source.includes('offlineCacheWarningStorageKey')],
  ['snapshot stored', source.includes('String(list.dataUpdatedAt)')],
  ['lazy initialization', source.includes('useState(() =>')],
  ['ssr guard', source.includes("typeof window === 'undefined'")],
  ['dismiss persisted', source.includes('sessionStorage.setItem')],
  ['snapshot cleared', source.includes('sessionStorage.removeItem')],
  ['dismiss condition preserved', source.includes('!isOfflineCacheWarningDismissed')],
  ['snapshot rearm preserved', source.includes('cacheSnapshotChanged')]
] as const;
const failed = checks.filter(([, ok]) => !ok);
const report = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name), ok: failed.length === 0 };
if (json) console.log(JSON.stringify(report, null, 2));
else if (report.ok) console.log(`FRONTEND_OFFLINE_CACHE_WARNING_SESSION_DISMISS_OK:${entity}:checks=${report.checks}:passed=${report.passed}`);
else console.error(`FRONTEND_OFFLINE_CACHE_WARNING_SESSION_DISMISS_ERROR:${entity}:failed=${report.failed.join(',')}`);
if (!report.ok) process.exit(1);
function toPascalCase(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(''); }
