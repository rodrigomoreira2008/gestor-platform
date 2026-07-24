import { renderFrontendDelphiRuntime } from '../frontendDelphiRuntimeGenerator';
import { generateFrontendFilesWithDelphiActions } from '../frontendGeneratorWithDelphiActions';
import type { ResolvedForm } from '../resolvedForm';

const runtime = renderFrontendDelphiRuntime({ entityPascal: 'Produto', entity: 'produto' });
const resolved = {
  form: { entity: 'produto', title: 'Produto' },
  fields: [],
  actions: [],
  datasets: [],
  queries: [],
  databaseQueries: [],
  relationships: [],
  lookups: [],
  tabs: [],
  detailGrids: [],
  validations: [],
  warnings: [],
  methodActionPlans: [{
    methodName: 'TProdutoForm.btnGravarClick',
    hasPersistence: true,
    hasDestructiveAction: false,
    requiresReview: false,
    steps: [{ order: 0, kind: 'save', sourceRuleKind: 'saveDataset', sourceNodeId: 'node-1', target: 'qryProduto', requiresReview: false }]
  }]
} as unknown as ResolvedForm;
const files = generateFrontendFilesWithDelphiActions(resolved, { outputRoot: 'generated/produtos' });
const actions = files.find((file) => file.path.endsWith('/delphi/produtoDelphiActions.ts'));
const runtimeFile = files.find((file) => file.path.endsWith('/delphi/useProdutoDelphiRuntime.ts'));

const checks = [
  runtime.includes('useCreateProduto'),
  runtime.includes('useUpdateProduto'),
  runtime.includes('useRemoveProduto'),
  runtime.includes('if (options.id === undefined)'),
  runtime.includes('await create.mutateAsync(input)'),
  runtime.includes('await update.mutateAsync({ id: options.id, input })'),
  runtime.includes('await remove.mutateAsync(id)'),
  Boolean(actions?.content.includes('executeTProdutoFormBtnGravarClick')),
  Boolean(runtimeFile?.content.includes('useProdutoDelphiRuntime')),
  files.length >= 2
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, files: files.map((file) => file.path) };

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`FRONTEND_DELPHI_RUNTIME_GENERATOR_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!report.ok) process.exit(1);
