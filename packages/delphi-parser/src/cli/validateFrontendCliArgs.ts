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

const checks = [
  inline.positional.length === 5,
  inline.positional[0] === 'produto.dfm',
  inline.positional[4] === 'apps/frontend/src/modules/produtos',
  inline.withDelphiActions,
  inline.routePath === '/cadastros/produtos/',
  inline.routeExportAlias === 'produtoRoute',
  separated.positional.length === 3,
  separated.withDelphiActions,
  separated.routePath === '/cadastros/produtos',
  separated.routeExportAlias === 'produtoRoute'
];

const passed = checks.filter(Boolean).length;

if (passed !== checks.length) {
  throw new Error(`FRONTEND_CLI_ARGS_FAILED: checks=${checks.length}: passed=${passed}`);
}

console.log(`FRONTEND_CLI_ARGS_OK: checks=${checks.length}: passed=${passed}`);
