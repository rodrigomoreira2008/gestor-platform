import { renderFrontendDelphiPage } from '../frontendDelphiPageGenerator';
import type { MethodActionPlan } from '../methodActionPlanning';
import type { ResolvedAction } from '../resolvedForm';

const actions: ResolvedAction[] = [
  { name: 'btnGravar', label: 'Gravar', kind: 'update', event: { componentName: 'btnGravar', eventName: 'OnClick', handlerName: 'btnGravarClick' } },
  { name: 'btnExcluir', label: 'Excluir', kind: 'delete', event: { componentName: 'btnExcluir', eventName: 'OnClick', handlerName: 'btnExcluirClick' } }
];

const plans: MethodActionPlan[] = [
  { methodName: 'TProdutoForm.btnGravarClick', steps: [], hasPersistence: true, hasDestructiveAction: false, requiresReview: false },
  { methodName: 'TProdutoForm.btnExcluirClick', steps: [], hasPersistence: false, hasDestructiveAction: true, requiresReview: false }
];

const output = renderFrontendDelphiPage(actions, plans, { entityPascal: 'Produto', entity: 'produto' });
const checks = [
  output.includes('export function ProdutoDelphiPage()'),
  output.includes('ProdutoDelphiDialogController'),
  output.includes('useProdutoDelphiRuntime'),
  output.includes('executeTProdutoFormBtnExcluirClick'),
  output.includes('id: removing.id'),
  output.includes("setIsCreating(true)"),
  output.includes('setEditing(row)'),
  output.includes('setRemoving(row)'),
  output.includes('Evento DFM de exclusão associado: btnExcluir -> btnExcluirClick'),
  !output.includes('useCreateProduto') && !output.includes('useUpdateProduto') && !output.includes('useRemoveProduto')
];

const passed = checks.filter(Boolean).length;
if (passed !== checks.length) {
  throw new Error(`FRONTEND_DELPHI_PAGE_GENERATOR_FAILED:checks=${checks.length}:passed=${passed}`);
}

console.log(`FRONTEND_DELPHI_PAGE_GENERATOR_OK:checks=${checks.length}:passed=${passed}`);
