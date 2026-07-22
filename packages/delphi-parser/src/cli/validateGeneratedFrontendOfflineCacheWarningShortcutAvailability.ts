import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dfmToGestorForm } from '../dfmToGestorForm';
import { enrichGestorFormWithPas } from '../gestorPasEnrichment';
import { resolveForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningShortcutAvailabilityGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);
if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningShortcutAvailability.ts <dfm> <pas> <entity> <table> [--json]');
  process.exit(1);
}

const resolved = resolveForm(
  enrichGestorFormWithPas(
    dfmToGestorForm(readFileSync(resolve(dfmPath), 'utf8'), { entity, table }),
    readFileSync(resolve(pasPath), 'utf8')
  )
);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`));
if (!page) throw new Error(`Pagina gerada nao encontrada para ${entity}`);

const checks = [
  page.content.includes("aria-keyshortcuts={isOfflineCacheOld ? 'Enter Space' : undefined}"),
  page.content.includes('aria-disabled={!isOfflineCacheOld}'),
  page.content.includes('tabIndex={isOfflineCacheOld ? 0 : -1}'),
  page.content.includes('if (!isOfflineCacheOld) return;'),
  page.content.includes('role="button"'),
  page.content.includes("event.key !== 'Enter'"),
  page.content.includes("event.key !== ' '"),
  page.content.includes('event.preventDefault();'),
  page.content.includes('event.currentTarget.click();'),
  page.content.includes('aria-description={')
];
const passed = checks.filter(Boolean).length;
const result = { ok: passed === checks.length, entity, checks: checks.length, passed };
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else console.log(`FRONTEND_OFFLINE_CACHE_WARNING_SHORTCUT_AVAILABILITY_${result.ok ? 'OK' : 'ERROR'}:${entity}:checks=${checks.length}:passed=${passed}`);
if (!result.ok) process.exit(1);
