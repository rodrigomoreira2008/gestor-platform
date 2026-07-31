import { renderFrontendDelphiActionController } from '../frontendDelphiActionControllerGenerator';
import type { MethodActionPlan } from '../methodActionPlanning';
import type { ResolvedAction } from '../resolvedForm';

const actions: ResolvedAction[] = [
  {
    name: 'btnGravar',
    label: 'Gravar',
    kind: 'update',
    event: { componentName: 'btnGravar', eventName: 'OnClick', handlerName: 'btnGravarClick' }
  },
  {
    name: 'btnExcluir',
    label: 'Excluir',
    kind: 'delete',
    event: { componentName: 'btnExcluir', eventName: 'OnClick', handlerName: 'btnExcluirClick' }
  },
  {
    name: 'btnImprimir',
    label: 'Imprimir',
    kind: 'print',
    event: { componentName: 'btnImprimir', eventName: 'OnClick', handlerName: 'btnImprimirClick' }
  }
];

const plans: MethodActionPlan[] = [
  {
    methodName: 'TProdutoForm.btnGravarClick',
    steps: [],
    hasPersistence: true,
    hasDestructiveAction: false,
    requiresReview: false
  },
  {
    methodName: 'btnExcluirClick',
    steps: [],
    hasPersistence: false,
    hasDestructiveAction: true,
    requiresReview: false
  }
];

const output = renderFrontendDelphiActionController(actions, plans, {
  entityPascal: 'Produto',
  entity: 'produto'
});

const checks = [
  output.includes("executeTProdutoFormBtnGravarClick"),
  output.includes("executeBtnExcluirClick"),
  output.includes('useProdutoDelphiRuntime'),
  output.includes('btnGravar: () => executeTProdutoFormBtnGravarClick'),
  output.includes('btnExcluir: () => executeBtnExcluirClick'),
  output.includes("componentName: 'btnGravar'"),
  output.includes("handlerName: 'btnExcluirClick'"),
  output.includes("kind: 'delete'"),
  output.includes('Evento sem plano executável: btnImprimir.OnClick -> btnImprimirClick'),
  output.includes('useProdutoDelphiActionController')
];

const passed = checks.filter(Boolean).length;
if (passed !== checks.length) {
  console.error(`FRONTEND_DELPHI_ACTION_CONTROLLER_FAILED:checks=${checks.length}:passed=${passed}`);
  process.exitCode = 1;
} else {
  console.log(`FRONTEND_DELPHI_ACTION_CONTROLLER_OK:checks=${checks.length}:passed=${passed}`);
}
