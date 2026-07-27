import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseFrontendCliArgs } from '../frontendCliArgs';
import { generateFrontendFiles } from '../frontendGenerator';
import { generateFrontendFilesWithDelphiActions } from '../frontendGeneratorWithDelphiActions';
import { resolveDelphiForm } from '../resolveForm';

let cli;

try {
  cli = parseFrontendCliArgs(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const [dfmPath, pasPath, entity, table, outputRoot] = cli.positional;

if (!dfmPath || !pasPath || !entity) {
  console.error([
    'Uso:',
    'pnpm --filter @gestor/delphi-parser gen:frontend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]',
    '  [--delphi-actions]',
    '  [--route-path=/cadastros/entidade]',
    '  [--route-export-alias=entidadeRoute]'
  ].join(' '));
  process.exit(1);
}

if (!cli.withDelphiActions && (cli.routePath || cli.routeExportAlias)) {
  console.error('As opcoes --route-path e --route-export-alias exigem --delphi-actions.');
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

const files = cli.withDelphiActions
  ? generateFrontendFilesWithDelphiActions(resolvedForm, {
      outputRoot,
      routePath: cli.routePath,
      routeExportAlias: cli.routeExportAlias
    })
  : generateFrontendFiles(resolvedForm, outputRoot ? { outputRoot } : {});

for (const file of files) {
  const target = resolve(process.cwd(), file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, file.content, 'utf8');
  console.log(`Gerado: ${target}`);
}
