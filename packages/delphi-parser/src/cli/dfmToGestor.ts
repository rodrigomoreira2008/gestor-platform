import { readFileSync } from 'node:fs';
import { dfmToGestorForm } from '../dfmToGestorForm';

const [, , filePath, entity, table] = process.argv;

if (!filePath || !entity) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser dfm:gestor <arquivo.dfm> <entidade> [tabela]');
  process.exit(1);
}

const content = readFileSync(filePath, 'utf8');
const form = dfmToGestorForm(content, {
  entity,
  table,
  dfmFile: filePath.split(/[\\/]/).at(-1)
});

console.log(JSON.stringify(form, null, 2));
