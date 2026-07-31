import { renderFrontendDelphiDialogController } from '../frontendDelphiDialogControllerGenerator';
import type { MethodActionPlan } from '../methodActionPlanning';
import type { ResolvedAction } from '../resolvedForm';

const actions: ResolvedAction[] = [
  {
    name: 'btnGravar',
    label: 'Gravar',
    kind: 'update',
    event: { componentName: 'btnGravar', eventName: 'OnClick', handlerName: 'btnGravarClick' }
  }
];

const plans: MethodActionPlan[] = [
  {
    methodName: 'TProdutoForm.btnGravarClick',
    hasPersistence: true,
    hasDestructiveAction: false,
    requiresReview: false,
    steps: [
      {
        order: 1,
        kind: 'save',
        sourceRuleKind: 'saveDataset',
        sourceNodeId: 'node-1',
        target: 'qryProduto',
        requiresReview: false
      },
      {
        order: 2,
        kind: 'close',
        sourceRuleKind: 'closeForm',
        sourceNodeId: 'node-2',
        requiresReview: false
      }
    ]
  }
];

const generated = renderFrontendDelphiDialogController(actions, plans, {
  entityPascal: 'Produto',
  entity: 'produto'
});

const checks = [
  generated.includes("import { executeTProdutoFormBtnGravarClick } from './produtoDelphiActions';"),
  generated.includes('export function ProdutoDelphiDialogController'),
  generated.includes('id: value?.id'),
  generated.includes('onClose,'),
  generated.includes('await executeTProdutoFormBtnGravarClick(runtime, { input, id: value?.id });'),
  generated.includes('<ProdutoTabbedForm'),
  generated.includes('initialValue={value ?? undefined}'),
  generated.includes('void handleSubmit(input)'),
  generated.includes("value ? 'Editar Produto' : 'Novo Produto'"),
  generated.includes('Evento DFM de gravação associado: btnGravar -> btnGravarClick')
];

const passed = checks.filter(Boolean).length;
if (passed !== checks.length) {
  throw new Error(`FRONTEND_DELPHI_DIALOG_CONTROLLER_FAILED:checks=${checks.length}:passed=${passed}`);
}

console.log(`FRONTEND_DELPHI_DIALOG_CONTROLLER_OK:checks=${checks.length}:passed=${passed}`);
