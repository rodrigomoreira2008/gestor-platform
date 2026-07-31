import { buildMethodActionPlans } from '../methodActionPlanning';
import { inferBusinessRules } from '../businessRuleInference';
import { parsePascalUnit } from '../pasParser';

const source = `
unit ProdutoForm;
interface
implementation
procedure TProdutoForm.btnGravarClick(Sender: TObject);
begin
  if edtNome.Text = '' then
  begin
    ShowMessage('Informe o nome');
    Abort;
  end;
  if not qryProduto.Active then
    qryProduto.Open;
  qryProduto.Post;
  AtualizarLista;
  Close;
end;

procedure TProdutoForm.btnExcluirClick(Sender: TObject);
begin
  qryProduto.Delete;
end;
end.
`;

const parsed = parsePascalUnit(source);
const rules = inferBusinessRules(parsed.methodFlows);
const plans = buildMethodActionPlans(rules);
const savePlan = plans.find((plan) => /btnGravarClick$/i.test(plan.methodName));
const deletePlan = plans.find((plan) => /btnExcluirClick$/i.test(plan.methodName));
const kinds = savePlan?.steps.map((step) => step.kind) ?? [];

const checks = [
  plans.length === 2,
  kinds.includes('validate'),
  kinds.includes('message'),
  kinds.includes('openDataset'),
  kinds.includes('save'),
  kinds.includes('invoke'),
  kinds.includes('close'),
  savePlan?.hasPersistence === true,
  savePlan?.requiresReview === true,
  deletePlan?.hasDestructiveAction === true
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, plans };

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`METHOD_ACTION_PLANNING_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!report.ok) process.exit(1);
