import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { generateFrontendFiles } from '../frontendGenerator';
import { resolveDelphiForm } from '../resolveForm';

const [, , dfmPath, pasPath, entity, table, outputRoot] = process.argv;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser gen:frontend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), {
  entity,
  table,
  dfmFile: dfmPath.split(/[\\/]/).at(-1),
  pasFile: pasPath.split(/[\\/]/).at(-1)
});

const files = generateFrontendFiles(resolved, outputRoot ? { outputRoot } : {});

for (const file of files) {
  const target = join(process.cwd(), file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, file.content, 'utf8');
  console.log(`Gerado: ${file.path}`);
}
