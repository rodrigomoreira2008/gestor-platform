import { readFileSync } from 'node:fs';
import { resolveDelphiForm } from '../resolveForm';

const [, , dfmPath, pasPath, entity, table] = process.argv;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser resolve:form <arquivo.dfm> <arquivo.pas> <entidade> [tabela]');
  process.exit(1);
}

const resolvedForm = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), {
  entity,
  table,
  dfmFile: dfmPath.split(/[\\/]/).at(-1),
  pasFile: pasPath.split(/[\\/]/).at(-1)
});

if (resolvedForm.fields.length === 0) {
  console.error('Formulario resolvido sem campos. Revise o DFM/PAS ou o mapeamento de componentes.');
  process.exit(1);
}

console.log(JSON.stringify(resolvedForm, null, 2));
