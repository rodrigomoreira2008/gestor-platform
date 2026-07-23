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
  Controle := GerarControle('PRODUTO');
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
const checks = [
  rules.some((rule) => rule.kind === 'requiredField' && rule.field === 'edtNome' && rule.message === 'Informe o nome' && rule.confidence === 'high'),
  rules.some((rule) => rule.kind === 'showMessage' && rule.message === 'Informe o nome'),
  rules.some((rule) => rule.kind === 'ensureDatasetOpen' && rule.target === 'qryProduto' && rule.condition === 'not qryProduto.Active'),
  rules.some((rule) => rule.kind === 'saveDataset' && rule.target === 'qryProduto'),
  rules.some((rule) => rule.kind === 'deleteRecord' && rule.target === 'qryProduto'),
  rules.some((rule) => rule.kind === 'assignment' && rule.target === 'Controle' && rule.expression?.includes('GerarControle')),
  rules.some((rule) => rule.kind === 'customCall' && rule.target === 'AtualizarLista'),
  rules.some((rule) => rule.kind === 'closeForm' && rule.target === 'Close'),
  rules.every((rule) => Boolean(rule.sourceNodeId) && Boolean(rule.methodName)),
  parsed.warnings.length === 0
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, rules };

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`BUSINESS_RULE_INFERENCE_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!report.ok) process.exit(1);
