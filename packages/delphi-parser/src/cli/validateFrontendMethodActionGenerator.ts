import { renderFrontendMethodActionAdapters } from '../frontendMethodActionGenerator';
import type { MethodActionPlan } from '../methodActionPlanning';

const plans: MethodActionPlan[] = [
  {
    methodName: 'TProdutoForm.btnGravarClick',
    hasPersistence: true,
    hasDestructiveAction: false,
    requiresReview: true,
    steps: [
      { order: 0, kind: 'validate', sourceRuleKind: 'requiredField', sourceNodeId: 'n1', field: 'NOME' },
      { order: 1, kind: 'openDataset', sourceRuleKind: 'ensureDatasetOpen', sourceNodeId: 'n2', target: 'qryProduto' },
      { order: 2, kind: 'save', sourceRuleKind: 'saveDataset', sourceNodeId: 'n3', target: 'qryProduto' },
      { order: 3, kind: 'message', sourceRuleKind: 'showMessage', sourceNodeId: 'n4', message: 'Produto salvo com sucesso' },
      { order: 4, kind: 'invoke', sourceRuleKind: 'customCall', sourceNodeId: 'n5', target: 'AtualizarLista', requiresReview: true },
      { order: 5, kind: 'close', sourceRuleKind: 'closeForm', sourceNodeId: 'n6', target: 'Close' }
    ]
  },
  {
    methodName: 'TProdutoForm.btnExcluirClick',
    hasPersistence: false,
    hasDestructiveAction: true,
    requiresReview: false,
    steps: [
      { order: 0, kind: 'delete', sourceRuleKind: 'deleteRecord', sourceNodeId: 'n7', target: 'qryProduto' }
    ]
  }
];

const output = renderFrontendMethodActionAdapters(plans, { entityPascal: 'Produto', entity: 'produto' });
const checks = [
  output.includes('export interface DelphiActionRuntime'),
  output.includes('executeTProdutoFormBtnGravarClick'),
  output.includes("runtime.openDataset('qryProduto')"),
  output.includes('await runtime.save(context.input)'),
  output.includes("runtime.notify?.('Produto salvo com sucesso')"),
  output.includes("runtime.invoke('AtualizarLista'"),
  output.includes('runtime.close?.()'),
  output.includes('executeTProdutoFormBtnExcluirClick'),
  output.includes("throw new Error('Identificador obrigatório para exclusão.')"),
  output.includes('await runtime.remove(context.id)')
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, output };
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`FRONTEND_METHOD_ACTION_GENERATOR_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);
if (!report.ok) process.exit(1);
