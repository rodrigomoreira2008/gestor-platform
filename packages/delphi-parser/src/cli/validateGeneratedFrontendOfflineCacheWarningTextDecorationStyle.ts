import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dfmToGestorForm } from '../dfmToGestorForm';
import { enrichGestorFormWithPas } from '../gestorPasEnrichment';
import { resolveForm } from '../resolveForm';
import { generateFrontendFiles } from '../frontendOfflineCacheWarningTextDecorationStyleGenerator';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);
if (!dfmPath || !pasPath || !entity || !table) {
  console.error('Uso: tsx validateGeneratedFrontendOfflineCacheWarningTextDecorationStyle.ts <dfm> <pas> <entity> <table> [--json]');
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
  page.content.includes("textDecorationStyle: 'solid'"),
  page.content.includes("textDecorationThickness: 'auto'"),
  page.content.includes("textDecorationSkipInk: 'auto'"),
  page.content.includes("textUnderlineOffset: 'auto'"),
  page.content.includes("textUnderlinePosition: 'auto'"),
  page.content.includes("textCombineUpright: 'none'"),
  page.content.includes("textOrientation: 'mixed'"),
  page.content.includes("textEmphasis: 'none'"),
  page.content.includes("textDecoration: 'none'"),
  page.content.includes("maxInlineSize: '100%'")
];
const passed = checks.filter(Boolean).length;
const result = { ok: passed === checks.length, entity, checks: checks.length, passed };
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else console.log(`FRONTEND_OFFLINE_CACHE_WARNING_TEXT_DECORATION_STYLE_${result.ok ? 'OK' : 'ERROR'}:${entity}:checks=${checks.length}:passed=${passed}`);
if (!result.ok) process.exit(1);
