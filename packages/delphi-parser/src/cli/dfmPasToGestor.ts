import { readFileSync } from 'node:fs';
import { dfmToGestorForm } from '../dfmToGestorForm';
import { enrichGestorFormWithPascal } from '../gestorPasEnrichment';
import { parsePascalUnit } from '../pasParser';

const [, , dfmPath, pasPath, entity, table] = process.argv;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser dfm-pas:gestor <arquivo.dfm> <arquivo.pas> <entidade> [tabela]');
  process.exit(1);
}

const dfmContent = readFileSync(dfmPath, 'utf8');
const pasContent = readFileSync(pasPath, 'utf8');

const form = dfmToGestorForm(dfmContent, {
  entity,
  table,
  dfmFile: dfmPath.split(/[\\/]/).at(-1),
  pasFile: pasPath.split(/[\\/]/).at(-1)
});

const pascal = parsePascalUnit(pasContent);
const enriched = enrichGestorFormWithPascal(form, pascal);

console.log(JSON.stringify(enriched.form, null, 2));
