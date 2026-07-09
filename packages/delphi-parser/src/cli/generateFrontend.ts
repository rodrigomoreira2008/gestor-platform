import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { generateFrontendFiles } from '../frontendGenerator';
import { resolveDelphiForm } from '../resolveForm';

const [, , dfmPath, pasPath, entity, table, outputRoot] = process.argv;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser gen:frontend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]');
  process.exit(1);
}

const resolvedForm = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), {
  entity,
  table,
  dfmFile: dfmPath.split(/[\\/]/).at(-1),
  pasFile: pasPath.split(/[\\/]/).at(-1)
});

if (resolvedForm.fields.length === 0) {
  console.error('Nao foi possivel gerar o frontend: nenhum campo foi resolvido a partir do DFM/PAS.');
  process.exit(1);
}

const files = generateFrontendFiles(resolvedForm, outputRoot ? { outputRoot } : {});

for (const file of files) {
  const target = resolve(process.cwd(), file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, file.content, 'utf8');
  console.log(`Gerado: ${target}`);
}
