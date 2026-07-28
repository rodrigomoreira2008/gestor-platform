import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseFrontendCliArgs } from '../frontendCliArgs';
import { generateFrontendFiles } from '../frontendGenerator';
import { generateFrontendFilesWithDelphiActions } from '../frontendGeneratorWithDelphiActions';
import { resolveDelphiForm } from '../resolveForm';

const usage = [
  'Uso:',
  'pnpm --filter @gestor/delphi-parser gen:frontend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]',
  '',
  'Opcoes:',
  '  --delphi-actions                  Gera runtime, controladores, pagina e rota orientados pelos eventos Delphi.',
  '  --route-path=<caminho>            Define o caminho usado nos snippets de rota Delphi.',
  '  --route-export-alias=<nome>       Define o nome exportado para o objeto de rota Delphi.',
  '  -h, --help                        Mostra esta ajuda.',
  '',
  'Exemplo:',
  'pnpm --filter @gestor/delphi-parser gen:frontend produto.dfm produto.pas Produto PRODUTOS apps/frontend/src/modules/produtos --delphi-actions --route-path=/cadastros/produtos --route-export-alias=produtoRoute'
].join('\n');

let cli;

try {
  cli = parseFrontendCliArgs(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(`\n${usage}`);
  process.exit(1);
}

if (cli.help) {
  console.log(usage);
  process.exit(0);
}

const [dfmPath, pasPath, entity, table, outputRoot] = cli.positional;

if (!dfmPath || !pasPath || !entity) {
  console.error(usage);
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
