import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dfmToGestorForm } from '../dfmToGestorForm';
import { enrichGestorFormWithPas } from '../gestorPasEnrichment';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningButtonRoleGenerator';
import { resolveForm } from '../resolveForm';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);
if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningButtonRole.ts <dfm> <pas> <entidade> <tabela>');
  process.exit(1);
}

const form = dfmToGestorForm(readFileSync(resolve(dfmPath), 'utf8'), { entity, table });
const enriched = enrichGestorFormWithPas(form, readFileSync(resolve(pasPath), 'utf8'));
const resolved = resolveForm(enriched);
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`));
if (!page) throw new Error(`Página gerada não encontrada para ${entity}`);

const checks = [
  ['button role', 'role="button"'],
  ['state description', 'aria-description={'],
  ['live region', 'aria-live="polite"'],
  ['atomic updates', 'aria-atomic="true"'],
  ['text relevance', 'aria-relevant="text"'],
  ['pressed state', 'aria-pressed={isOfflineCacheOld && !isOfflineCacheWarningDismissed}'],
  ['expanded state', 'aria-expanded={isOfflineCacheOld && !isOfflineCacheWarningDismissed}'],
  ['controlled alert', 'aria-controls="offline-cache-warning-alert"'],
  ['action label', 'aria-label={'],
  ['keyboard shortcut', 'aria-keyshortcuts="Escape"']
] as const;

const failed = checks.filter(([, token]) => !page.content.includes(token));
const result = { entity, checks: checks.length, passed: checks.length - failed.length, failed: failed.map(([name]) => name) };
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else console.log(`FRONTEND_OFFLINE_CACHE_WARNING_BUTTON_ROLE_OK:${entity}:checks=${result.checks}:passed=${result.passed}`);
if (failed.length > 0) process.exit(1);
