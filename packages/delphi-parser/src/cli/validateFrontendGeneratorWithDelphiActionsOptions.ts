import { generateFrontendFilesWithDelphiActions } from '../frontendGeneratorWithDelphiActions';
import type { ResolvedForm } from '../resolvedForm';

const resolved = {
  form: { entity: 'Produto' },
  fields: [],
  lookups: [],
  detailGrids: [],
  tabs: [],
  actions: [],
  methodActionPlans: []
} as unknown as ResolvedForm;

const files = generateFrontendFilesWithDelphiActions(resolved, {
  outputRoot: 'generated/produtos',
  routePath: 'cadastros/produtos/',
  routeExportAlias: 'produtoRoute'
});

const route = files.find((file) => file.path.endsWith('/Generated/ProdutoDelphiRoute.tsx.txt'));
const selection = files.find((file) => file.path.endsWith('/Generated/ProdutoPageSelection.tsx.txt'));

const checks = [
  route?.path === 'generated/produtos/Generated/ProdutoDelphiRoute.tsx.txt',
  route?.content.includes("export const produtoRoute ="),
  route?.content.includes("path: '/cadastros/produtos'"),
  route?.content.includes('<ProdutoDelphiPage />'),
  selection?.path === 'generated/produtos/Generated/ProdutoPageSelection.tsx.txt',
  selection?.content.includes("path: '/cadastros/produtos'"),
  selection?.content.includes('<ProdutoPage />'),
  selection?.content.includes('<ProdutoDelphiPage />'),
  files.some((file) => file.path === 'generated/produtos/pages/ProdutoDelphiPage.tsx'),
  files.some((file) => file.path === 'generated/produtos/delphi/ProdutoDelphiDialogController.tsx')
];

if (checks.some((check) => !check)) {
  throw new Error(`FRONTEND_GENERATOR_WITH_DELPHI_ACTIONS_OPTIONS_FAILED:${checks.map((check, index) => `${index + 1}=${Boolean(check)}`).join(',')}`);
}

console.log(`FRONTEND_GENERATOR_WITH_DELPHI_ACTIONS_OPTIONS_OK:checks=${checks.length}:passed=${checks.filter(Boolean).length}`);
