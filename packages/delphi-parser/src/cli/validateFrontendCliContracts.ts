import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontendCliArgs } from '../frontendCliArgs';
import { renderFrontendCliUsage } from '../frontendCliUsage';

const parsedInlineOptions = parseFrontendCliArgs([
  'produto.dfm',
  'produto.pas',
  'Produto',
  'PRODUTOS',
  'apps/frontend/src/modules/produtos',
  '--delphi-actions',
  '--route-path=/cadastros/produtos',
  '--route-export-alias=produtoRoute'
]);

const parsedSeparatedOptions = parseFrontendCliArgs([
  'produto.dfm',
  'produto.pas',
  'Produto',
  '--route-path',
  '/cadastros/produtos',
  '--route-export-alias',
  'produtoRoute'
]);

const helpLong = parseFrontendCliArgs(['--help']);
const helpShort = parseFrontendCliArgs(['-h']);
const usage = renderFrontendCliUsage();
const compactUsage = renderFrontendCliUsage({ includeExample: false });
const cliDirectory = dirname(fileURLToPath(import.meta.url));
const generatorSource = readFileSync(resolve(cliDirectory, 'generateFrontend.ts'), 'utf8');
const helpSource = readFileSync(resolve(cliDirectory, 'showHelp.ts'), 'utf8');

function throwsWithMessage(values: string[], expectedMessage: string): boolean {
  try {
    parseFrontendCliArgs(values);
    return false;
  } catch (error) {
    return error instanceof Error && error.message === expectedMessage;
  }
}

const checks = [
  parsedInlineOptions.positional.length === 5,
  parsedInlineOptions.withDelphiActions,
  parsedInlineOptions.routePath === '/cadastros/produtos',
  parsedInlineOptions.routeExportAlias === 'produtoRoute',
  parsedSeparatedOptions.positional.length === 3,
  parsedSeparatedOptions.routePath === '/cadastros/produtos',
  parsedSeparatedOptions.routeExportAlias === 'produtoRoute',
  helpLong.help && helpLong.positional.length === 0,
  helpShort.help && helpShort.positional.length === 0,
  throwsWithMessage(['--route-path'], 'A opcao --route-path exige um valor.'),
  throwsWithMessage(['--route-export-alias='], 'A opcao --route-export-alias exige um valor.'),
  throwsWithMessage(['--route-path', '   '], 'A opcao --route-path exige um valor.'),
  throwsWithMessage(['--route-export-alias', '\t'], 'A opcao --route-export-alias exige um valor.'),
  throwsWithMessage(['--route-path', '-h'], 'A opcao --route-path exige um valor.'),
  throwsWithMessage(['--route-export-alias', '--delphi-actions'], 'A opcao --route-export-alias exige um valor.'),
  throwsWithMessage(['--desconhecida'], 'Opcao desconhecida: --desconhecida'),
  throwsWithMessage(['-x'], 'Opcao desconhecida: -x'),
  usage.includes('--delphi-actions'),
  usage.includes('--route-path=<caminho>'),
  usage.includes('--route-export-alias=<nome>'),
  usage.includes('--help, -h'),
  usage.includes('Exemplo:'),
  !compactUsage.includes('Exemplo:'),
  compactUsage.includes('--route-path=<caminho>'),
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
