import { parseFrontendCliArgs } from '../frontendCliArgs';

const inline = parseFrontendCliArgs([
  'produto.dfm',
  'produto.pas',
  'Produto',
  'PRODUTOS',
  'apps/frontend/src/modules/produtos',
  '--delphi-actions',
  '--route-path=/cadastros/produtos/',
  '--route-export-alias=produtoRoute'
]);

const separated = parseFrontendCliArgs([
  'produto.dfm',
  'produto.pas',
  'Produto',
  '--delphi-actions',
  '--route-path',
  '/cadastros/produtos',
  '--route-export-alias',
  'produtoRoute'
]);

const rootRoute = parseFrontendCliArgs(['--delphi-actions', '--route-path=/']);
const longHelp = parseFrontendCliArgs(['--help']);
const shortHelp = parseFrontendCliArgs(['-h']);
const helpWithRouteOption = parseFrontendCliArgs(['--help', '--route-path=/cadastros/produtos']);
const helpWithExtraPositionals = parseFrontendCliArgs(['produto.dfm', 'produto.pas', 'Produto', 'TABELA', 'saida', 'extra', '--help']);

function throwsWithMessage(values: string[], expectedMessage: string): boolean {
  try {
    parseFrontendCliArgs(values);
    return false;
  } catch (error) {
    return error instanceof Error && error.message === expectedMessage;
  }
}

const reservedAliasMessage = 'A opcao --route-export-alias nao pode ser uma palavra reservada do TypeScript.';
const excessPositionalsMessage = 'Foram informados 6 argumentos posicionais; o maximo permitido e 5.';
const internalRouteMessage = 'A opcao --route-path deve ser um caminho interno iniciado por / e usar somente barras normais.';
const repeatedSeparatorMessage = 'A opcao --route-path nao pode conter barras consecutivas.';
const navigationSegmentMessage = 'A opcao --route-path nao pode conter os segmentos "." ou "..".';

const checks = [
  inline.positional.length === 5,
  inline.positional[0] === 'produto.dfm',
  inline.positional[4] === 'apps/frontend/src/modules/produtos',
  inline.withDelphiActions,
  !inline.help,
  inline.routePath === '/cadastros/produtos/',
  inline.routeExportAlias === 'produtoRoute',
  separated.positional.length === 3,
  separated.withDelphiActions,
  separated.routePath === '/cadastros/produtos',
  separated.routeExportAlias === 'produtoRoute',
  rootRoute.routePath === '/',
  longHelp.help && longHelp.positional.length === 0,
  shortHelp.help && shortHelp.positional.length === 0,
  helpWithRouteOption.help && helpWithRouteOption.routePath === '/cadastros/produtos',
  helpWithExtraPositionals.help && helpWithExtraPositionals.positional.length === 6,
  throwsWithMessage(['--route-path', '   '], 'A opcao --route-path exige um valor.'),
  throwsWithMessage(['--route-export-alias', '\t'], 'A opcao --route-export-alias exige um valor.'),
  throwsWithMessage(['--route-path', '-h'], 'A opcao --route-path exige um valor.'),
  throwsWithMessage(['--route-export-alias', '--delphi-actions'], 'A opcao --route-export-alias exige um valor.'),
  throwsWithMessage(['-x'], 'Opcao desconhecida: -x'),
  throwsWithMessage(
    ['--route-path=/produtos', '--route-path', '/cadastros/produtos'],
    'A opcao --route-path foi informada mais de uma vez.'
  ),
  throwsWithMessage(
    ['--route-export-alias=produtoRoute', '--route-export-alias', 'cadastroProdutoRoute'],
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
  throwsWithMessage(
    ['--delphi-actions', '--route-path=/cadastros/grupo produtos'],
    'A opcao --route-path deve conter apenas um caminho de rota, sem espacos, query string ou fragmento.'
  ),
  throwsWithMessage(
    ['--delphi-actions', '--route-path=/produtos?status=ativo'],
    'A opcao --route-path deve conter apenas um caminho de rota, sem espacos, query string ou fragmento.'
  ),
  throwsWithMessage(
    ['--delphi-actions', '--route-path=/produtos#lista'],
    'A opcao --route-path deve conter apenas um caminho de rota, sem espacos, query string ou fragmento.'
  ),
  throwsWithMessage(['--delphi-actions', '--route-path=cadastros/produtos'], internalRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=https://gestor.local/produtos'], internalRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/cadastros\\produtos'], internalRouteMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=//cadastros/produtos'], repeatedSeparatorMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/cadastros//produtos'], repeatedSeparatorMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/cadastros/./produtos'], navigationSegmentMessage),
  throwsWithMessage(['--delphi-actions', '--route-path=/cadastros/../produtos'], navigationSegmentMessage),
  throwsWithMessage(
    ['--delphi-actions', '--route-export-alias=produto-route'],
    'A opcao --route-export-alias deve ser um identificador TypeScript valido.'
  ),
  throwsWithMessage(
    ['--delphi-actions', '--route-export-alias=123ProdutoRoute'],
    'A opcao --route-export-alias deve ser um identificador TypeScript valido.'
  ),
  throwsWithMessage(['--delphi-actions', '--route-export-alias=default'], reservedAliasMessage),
  throwsWithMessage(['--delphi-actions', '--route-export-alias=class'], reservedAliasMessage),
  throwsWithMessage(['--delphi-actions', '--route-export-alias=await'], reservedAliasMessage),
  throwsWithMessage(['produto.dfm', 'produto.pas', 'Produto', 'TABELA', 'saida', 'extra'], excessPositionalsMessage)
];

const passed = checks.filter(Boolean).length;

if (passed !== checks.length) {
  throw new Error(`FRONTEND_CLI_ARGS_FAILED: checks=${checks.length}: passed=${passed}`);
}

console.log(`FRONTEND_CLI_ARGS_OK: checks=${checks.length}: passed=${passed}`);
