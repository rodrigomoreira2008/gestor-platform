import { renderFrontendDelphiRouteSnippet, renderFrontendPageSelectionSnippet } from '../frontendDelphiRouteGenerator';

const route = renderFrontendDelphiRouteSnippet({
  entityPascal: 'Produto',
  plural: 'produtos',
  routePath: 'cadastros/produtos/',
  exportAlias: 'produtoRoute'
});

const selection = renderFrontendPageSelectionSnippet({
  entityPascal: 'Produto',
  plural: 'produtos',
  routePath: '/cadastros/produtos/'
});

const checks = [
  route.includes("import { ProdutoDelphiPage } from '../modules/produtos/pages/ProdutoDelphiPage';"),
  route.includes('export const produtoRoute = {'),
  route.includes("path: '/cadastros/produtos'"),
  route.includes('element: <ProdutoDelphiPage />'),
  !route.includes("path: 'cadastros/produtos/'"),
  selection.includes('// CRUD genérico:'),
  selection.includes('// Comportamento orientado pelos eventos Delphi:'),
  selection.includes("path: '/cadastros/produtos'"),
  selection.includes('<ProdutoPage />'),
  selection.includes('<ProdutoDelphiPage />')
];

const passed = checks.filter(Boolean).length;
if (passed !== checks.length) {
  throw new Error(`FRONTEND_DELPHI_ROUTE_GENERATOR_FAILED:checks=${checks.length}:passed=${passed}`);
}

console.log(`FRONTEND_DELPHI_ROUTE_GENERATOR_OK:checks=${checks.length}:passed=${passed}`);
