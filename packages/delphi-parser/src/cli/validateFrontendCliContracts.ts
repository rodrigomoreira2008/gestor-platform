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
  '--route-path=/cadastros/produtos/',
  '--route-export-alias=produtoRoute'
]);

const parsedSeparatedOptions = parseFrontendCliArgs([
  'produto.dfm',
  'produto.pas',
  'Produto',
  '--delphi-actions',
  '--route-path',
  '/cadastros/produtos',
  '--route-export-alias',
  'produtoRoute'
]);

const parsedRootRoute = parseFrontendCliArgs(['--delphi-actions', '--route-path=/']);
const helpLong = parseFrontendCliArgs(['--help']);
const helpShort = parseFrontendCliArgs(['-h']);
const helpWithRouteOption = parseFrontendCliArgs(['--help', '--route-path=/cadastros/produtos']);
const helpWithExtraPositionals = parseFrontendCliArgs(['produto.dfm', 'produto.pas', 'Produto', 'TABELA', 'saida', 'extra', '--help']);
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

const invalidRouteMessage = 'A opcao --route-path deve conter apenas um caminho de rota, sem espacos, query string ou fragmento.';
const internalRouteMessage = 'A opcao --route-path deve ser um caminho interno iniciado por / e usar somente barras normais.';
const repeatedSeparatorMessage = 'A opcao --route-path nao pode conter barras consecutivas.';
const navigationSegmentMessage = 'A opcao --route-path nao pode conter os segmentos "." ou "..".';
const invalidAliasMessage = 'A opcao --route-export-alias deve ser um identificador TypeScript valido.';
const reservedAliasMessage = 'A opcao --route-export-alias nao pode ser uma palavra reservada do TypeScript.';
const excessPositionalsMessage = 'Foram informados 6 argumentos posicionais; o maximo permitido e 5.';

const checks = [
  parsedInlineOptions.positional.length === 5,
  parsedInlineOptions.withDelphiActions,
  parsedInlineOptions.routePath === '/cadastros/produtos',
  parsedInlineOptions.routeExportAlias === 'produtoRoute',
  parsedSeparatedOptions.positional.length === 3,
  parsedSeparatedOptions.routePath === '/cadastros/produtos',
  parsedSeparatedOptions.routeExportAlias === 'produtoRoute',
  parsedRootRoute.routePath === '/',
  helpLong.help && helpLong.positional.length === 0,
  helpShort.help && helpShort.positional.length === 0,
  helpWithRouteOption.help && helpWithRouteOption.routePath === '/cadastros/produtos',
  helpWithExtraPositionals.help && helpWithExtraPositionals.positional.length === 6,
  throwsWithMessage(['--route-path'], 'A opcao --route-path exige um valor.'),
  throwsWithMessage(['--route-export-alias='], 'A opcao --route-export-alias exige um valor.'),
  throwsWithMessage(['--route-path', '   '], 'A opcao --route-path exige um valor.'),
  throwsWithMessage(['--route-export-alias', '\t'], 'A opcao --route-export-alias exige um valor.'),
  throwsWithMessage(['--route-path', '-h'], 'A opcao --route-path exige um valor.'),
  throwsWithMessage(['--route-export-alias', '--delphi-actions'], 'A opcao --route-export-alias exige um valor.'),
  throwsWithMessage(['--desconhecida'], 'Opcao desconhecida: --desconhecida'),
  throwsWithMessage(['-x'], 'Opcao desconhecida: -x'),
  throwsWithMessage(
    ['--route-path=/produtos', '--route-path=/cadastros/produtos'],
    'A opcao --route-path foi informada mais de uma vez.'
  ),
  throwsWithMessage(
    ['--route-export-alias', 'produtoRoute', '--route-export-alias=cadastroProdutoRoute'],
    'A opcao --route-export-alias foi informada mais de uma vez.'
  ),
  throwsWithMessage(
    ['--delphi-actions', '--delphi-actions'],
    'A opcao --delphi-actions foi informada mais de uma vez.'
  ),
  throwsWithMessage(
    ['--route-path=/cadastros/produtos'],
    'As opcoes --route-path e --route-export-alias exigem --delphi-actions.'
  ),
  throwsWithMessage(
    ['--route-export-alias=produtoRoute'],
    'As opcoes --route-path e --route-export-alias exigem --delphi-actions.'
  ),
  throwsWithMessage(['--delphi-actions', '--route-path=/grupo produtos'], invalidRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/produtos?status=ativo'], invalidRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/produtos#lista'], invalidRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=cadastros/produtos'], internalRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=https://gestor.local/produtos'], internalRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/cadastros\\produtos'], internalRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=//cadastros/produtos'], repeatedSeparatorMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/cadastros//produtos'], repeatedSeparatorMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/cadastros/./produtos'], navigationSegmentMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/cadastros/../produtos'], navigationSegmentMessage),
  throwsWithMessage(['--delphi-actions', '--route-export-alias=produto-route'], invalidAliasMessage),
  throwsWithMessage(['--delphi-actions', '--route-export-alias=123ProdutoRoute'], invalidAliasMessage),
  throwsWithMessage(['--delphi-actions', '--route-export-alias=default'], reservedAliasMessage),
  throwsWithMessage(['--delphi-actions', '--route-export-alias=class'], reservedAliasMessage),
  throwsWithMessage(['--delphi-actions', '--route-export-alias=await'], reservedAliasMessage),
  throwsWithMessage(['produto.dfm', 'produto.pas', 'Produto', 'TABELA', 'saida', 'extra'], excessPositionalsMessage),
  usage.includes('--delphi-actions'),
  usage.includes('--route-path=<caminho>'),
  usage.includes('--route-export-alias=<nome>'),
  usage.includes('--help, -h'),
  usage.includes('Exemplo:'),
  !compactUsage.includes('Exemplo:'),
  compactUsage.includes('--route-path=<caminho>'),
  generatorSource.includes('const usage = renderFrontendCliUsage();'),
  !generatorSource.includes('if (!cli.withDelphiActions && (cli.routePath || cli.routeExportAlias))'),
  helpSource.includes('console.log(renderFrontendCliUsage());'),
  helpSource.includes('Detalhes de gen:frontend:')
];

const failed = checks.map((passed, index) => ({ passed, index: index + 1 })).filter((check) => !check.passed);

if (failed.length > 0) {
  console.error(`FRONTEND_CLI_CONTRACTS_FAILED: checks=${checks.length}: failed=${failed.map((check) => check.index).join(',')}`);
  process.exit(1);
}

console.log(`FRONTEND_CLI_CONTRACTS_OK: checks=${checks.length}: passed=${checks.length}`);
