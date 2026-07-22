import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDfm } from '../dfmParser';
import { parsePas } from '../pasParser';
import { resolveForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningEscapeDescriptionGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);
if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningEscapeDescription.ts <dfm> <pas> <entidade> <tabela>');
  process.exit(1);
}

const resolved = resolveForm(parseDfm(readFileSync(resolve(dfmPath), 'utf8')), parsePas(readFileSync(resolve(pasPath), 'utf8')), { entity, table });
const page = generateFrontendFiles(resolved).find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`));
if (!page) throw new Error(`Pagina ${entity}Page.tsx nao gerada`);

const checks = [
  page.content.includes('aria-describedby="offline-cache-warning-shortcut-description"'),
  page.content.includes('id="offline-cache-warning-shortcut-description"'),
  page.content.includes('Pressione Escape para dispensar este alerta.'),
  page.content.includes("position: 'absolute'"),
  page.content.includes("clip: 'rect(0, 0, 0, 0)'"),
  page.content.includes('aria-keyshortcuts="Escape"'),
  page.content.includes("event.key !== 'Escape'"),
  page.content.includes('offlineCacheWarningChipRef.current?.focus()'),
  page.content.includes('role="status"'),
  page.content.includes('tabIndex={-1}')
];

const passed = checks.filter(Boolean).length;
if (passed !== checks.length) {
  console.error(`FRONTEND_OFFLINE_CACHE_WARNING_ESCAPE_DESCRIPTION_ERROR:${entity}:checks=${checks.length}:passed=${passed}`);
  process.exit(1);
}
console.log(`FRONTEND_OFFLINE_CACHE_WARNING_ESCAPE_DESCRIPTION_OK:${entity}:checks=${checks.length}:passed=${passed}`);
