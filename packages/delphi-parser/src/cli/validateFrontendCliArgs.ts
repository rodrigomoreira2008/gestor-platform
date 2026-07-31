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

const longHelp = parseFrontendCliArgs(['--help']);
const shortHelp = parseFrontendCliArgs(['-h']);

function throwsWithMessage(values: string[], expectedMessage: string): boolean {
  try {
    parseFrontendCliArgs(values);
    return false;
  } catch (error) {
    return error instanceof Error && error.message === expectedMessage;
  }
}

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
  longHelp.help && longHelp.positional.length === 0,
  shortHelp.help && shortHelp.positional.length === 0,
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
  )
];

const passed = checks.filter(Boolean).length;

if (passed !== checks.length) {
  throw new Error(`FRONTEND_CLI_ARGS_FAILED: checks=${checks.length}: passed=${passed}`);
}

console.log(`FRONTEND_CLI_ARGS_OK: checks=${checks.length}: passed=${passed}`);
