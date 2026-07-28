import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseFrontendCliArgs } from '../frontendCliArgs';
import { renderFrontendCliUsage } from '../frontendCliUsage';

const parsed = parseFrontendCliArgs([
  'produto.dfm',
  'produto.pas',
  'Produto',
  'PRODUTOS',
  'apps/frontend/src/modules/produtos',
  '--delphi-actions',
  '--route-path=/cadastros/produtos',
  '--route-export-alias=produtoRoute'
]);

const usage = renderFrontendCliUsage();
const compactUsage = renderFrontendCliUsage({ includeExample: false });
const generatorSource = readFileSync(resolve(process.cwd(), 'src/cli/generateFrontend.ts'), 'utf8');
const helpSource = readFileSync(resolve(process.cwd(), 'src/cli/showHelp.ts'), 'utf8');

const checks = [
  parsed.positional.length === 5,
  parsed.withDelphiActions,
  parsed.routePath === '/cadastros/produtos',
  parsed.routeExportAlias === 'produtoRoute',
  usage.includes('--delphi-actions'),
  usage.includes('--route-path=<caminho>'),
  usage.includes('--route-export-alias=<nome>'),
  usage.includes('Exemplo:'),
  !compactUsage.includes('Exemplo:'),
  generatorSource.includes('const usage = renderFrontendCliUsage();'),
  helpSource.includes('console.log(renderFrontendCliUsage());'),
  helpSource.includes('Detalhes de gen:frontend:')
];

const failed = checks.map((passed, index) => ({ passed, index: index + 1 })).filter((check) => !check.passed);

if (failed.length > 0) {
  console.error(`FRONTEND_CLI_CONTRACTS_FAILED: checks=${checks.length}: failed=${failed.map((check) => check.index).join(',')}`);
  process.exit(1);
}

console.log(`FRONTEND_CLI_CONTRACTS_OK: checks=${checks.length}: passed=${checks.length}`);