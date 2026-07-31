import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dfmToGestorForm } from '../dfmToGestorForm';
import { enrichGestorFormWithPas } from '../gestorPasEnrichment';
import { resolveForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningTextSpacingGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);
if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningTextSpacing.ts <dfm> <pas> <entity> <table> [--json]');
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
  page.content.includes('lineHeight: 1.5'),
  page.content.includes("letterSpacing: 'normal'"),
  page.content.includes("wordSpacing: 'normal'"),
  page.content.includes('paddingBlock: 4'),
  page.content.includes("whiteSpace: 'normal'"),
  page.content.includes("overflowWrap: 'anywhere'"),
  page.content.includes("height: 'auto'"),
  page.content.includes("maxWidth: '100%'"),
  page.content.includes('scrollMarginBlock: 16'),
  page.content.includes("'@media (pointer: coarse)'")
];
const passed = checks.filter(Boolean).length;
const result = { ok: passed === checks.length, entity, checks: checks.length, passed };
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else console.log(`FRONTEND_OFFLINE_CACHE_WARNING_TEXT_SPACING_${result.ok ? 'OK' : 'ERROR'}:${entity}:checks=${checks.length}:passed=${passed}`);
if (!result.ok) process.exit(1);
