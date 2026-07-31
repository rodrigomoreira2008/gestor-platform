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
  end
  else
  begin
    qryProduto.Post;
    Controle := GerarControle('PRODUTO');
  end;

  AtualizarLista;
end;

end.
`;

const result = parsePascalUnit(source);
const flow = result.methodFlows.find((item) => item.methodName === 'btnGravarClick');
const conditional = flow?.nodes.find((node) => node.kind === 'if');
const elseNode = conditional?.alternate?.[0];

const checks = [
  Boolean(flow),
  conditional?.expression === "edtNome.Text = ''",
  conditional?.children.some((node) => node.kind === 'message' && node.expression?.includes('Informe o nome')) === true,
  conditional?.children.some((node) => node.kind === 'abort') === true,
  elseNode?.kind === 'else',
  elseNode?.children.some((node) => node.kind === 'call' && node.target === 'qryProduto.Post') === true,
  elseNode?.children.some((node) => node.kind === 'assignment' && node.target === 'Controle') === true,
  flow?.nodes.some((node) => node.kind === 'call' && node.target === 'AtualizarLista') === true,
  flow?.warnings.length === 0,
  result.warnings.length === 0
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, flow };

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`PASCAL_CONTROL_FLOW_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!report.ok) process.exit(1);
