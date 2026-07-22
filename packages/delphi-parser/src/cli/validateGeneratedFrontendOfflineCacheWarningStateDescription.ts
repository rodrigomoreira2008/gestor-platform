import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningStateDescriptionGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);
if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningStateDescription.ts <dfm> <pas> <entity> <table>');
  process.exit(1);
}

const resolved = resolveForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`));
if (!page) throw new Error(`Página frontend não gerada para ${entity}`);

const checks = [
  'aria-description={',
  "? 'O alerta de dados desatualizados está oculto.'",
  ": 'O alerta de dados desatualizados está visível.'",
  ": 'Os dados estão atualizados.'",
  'aria-relevant="text"',
  'aria-live="polite"',
  'aria-atomic="true"',
  'aria-pressed={isOfflineCacheOld && !isOfflineCacheWarningDismissed}',
  'aria-expanded={isOfflineCacheOld && !isOfflineCacheWarningDismissed}',
  'aria-controls="offline-cache-warning-alert"'
];

const failed = checks.filter((check) => !page.content.includes(check));
if (failed.length > 0) {
  console.error(`FRONTEND_OFFLINE_CACHE_WARNING_STATE_DESCRIPTION_ERROR:${entity}:missing=${failed.join('|')}`);
  process.exit(1);
}

console.log(`FRONTEND_OFFLINE_CACHE_WARNING_STATE_DESCRIPTION_OK:${entity}:checks=${checks.length}:passed=${checks.length}`);
