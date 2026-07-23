import { parsePascalUnit } from '../pasParser';

const source = `unit CadastroProduto;

interface

uses
  System.SysUtils,
  Data.DB,
  ProdutoService in 'ProdutoService.pas';

{$I regras-produto.inc}

implementation

procedure TFrmProduto.btnSalvarClick(Sender: TObject);
begin
  if qryProduto.FieldByName('STATUS').AsString = 'I' then
  begin
    ShowMessage('Produto inativo');
    Abort;
  end;

  qryProduto.Post;
  Controle := GerarControle('PRODUTO');
end;

end.`;

const parsed = parsePascalUnit(source);
const checks = [
  parsed.methods.some((method) => method.name === 'btnSalvarClick'),
  parsed.eventHints.some((event) => event.componentName === 'btnSalvar' && event.eventName === 'OnClick'),
  parsed.dependencyHints.some((dependency) => dependency.name === 'System.SysUtils' && dependency.source === 'uses'),
  parsed.dependencyHints.some((dependency) => dependency.name === 'ProdutoService' && dependency.source === 'uses'),
  parsed.dependencyHints.some((dependency) => dependency.name === 'regras-produto.inc' && dependency.source === 'include'),
  parsed.ruleHints.some((rule) => rule.kind === 'condition' && rule.expression.includes("FieldByName('STATUS')")),
  parsed.ruleHints.some((rule) => rule.kind === 'abort'),
  parsed.ruleHints.some((rule) => rule.kind === 'call' && rule.target === 'qryProduto.Post'),
  parsed.ruleHints.some((rule) => rule.kind === 'assignment' && rule.target === 'Controle'),
  parsed.validationHints.some((validation) => validation.message === 'Produto inativo')
];

const passed = checks.filter(Boolean).length;
const result = { ok: passed === checks.length, checks: checks.length, passed };

if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else console.log(`PASCAL_INTELLIGENCE_${result.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!result.ok) process.exit(1);
