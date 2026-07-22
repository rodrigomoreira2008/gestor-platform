import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningActionLabelGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);
if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningActionLabel.ts <dfm> <pas> <entidade> <tabela>');
  process.exit(1);
}

const resolved = resolveForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`));
if (!page) throw new Error(`Pagina ${entity}Page.tsx nao gerada`);

const checks = [
  page.content.includes('aria-label={'),
  page.content.includes("'Mostrar alerta de dados desatualizados'"),
  page.content.includes("'Ocultar alerta de dados desatualizados'"),
  page.content.includes('`Última sincronização: ${offlineCacheUpdatedAtLabel}`'),
  page.content.includes('isOfflineCacheWarningDismissed'),
  page.content.includes('aria-controls="offline-cache-warning-alert"'),
  page.content.includes('aria-expanded={isOfflineCacheOld && !isOfflineCacheWarningDismissed}'),
  page.content.includes('id="offline-cache-warning-alert"'),
  page.content.includes('aria-keyshortcuts="Escape"'),
  page.content.includes('aria-describedby="offline-cache-warning-shortcut-description"')
];

const passed = checks.filter(Boolean).length;
if (passed !== checks.length) {
  console.error(`FRONTEND_OFFLINE_CACHE_WARNING_ACTION_LABEL_ERROR:${entity}:checks=${checks.length}:passed=${passed}`);
  process.exit(1);
}
console.log(`FRONTEND_OFFLINE_CACHE_WARNING_ACTION_LABEL_OK:${entity}:checks=${checks.length}:passed=${passed}`);
