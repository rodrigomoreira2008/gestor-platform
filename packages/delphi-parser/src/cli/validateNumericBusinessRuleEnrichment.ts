import { enrichFieldsWithBusinessRules } from '../businessRuleFieldEnrichment';
import { inferBusinessRules } from '../businessRuleInference';
import { parsePascalUnit } from '../pasParser';
import type { ResolvedField } from '../resolvedForm';

const source = `
unit ProdutoForm;
interface
implementation
procedure TProdutoForm.btnGravarClick(Sender: TObject);
begin
  if edtValor.Value <= 0 then
  begin
    ShowMessage('Valor deve ser maior que zero');
    Abort;
  end;

  if qryProduto.FieldByName('DESCONTO').AsFloat > 50 then
  begin
    ShowMessage('Desconto deve ser no máximo 50');
    Abort;
  end;
end;
end.
`;

const fields: ResolvedField[] = [
  { name: 'VALOR', label: 'Valor', required: false, validationMessages: [], source: { componentName: 'edtValor', componentClass: 'TEdit' } },
  { name: 'DESCONTO', label: 'Desconto', required: false, validationMessages: [], source: { componentName: 'edtDesconto', componentClass: 'TEdit' } }
];

const parsed = parsePascalUnit(source);
const rules = inferBusinessRules(parsed.methodFlows);
const enriched = enrichFieldsWithBusinessRules(fields, rules);
const valor = enriched.fields.find((field) => field.name === 'VALOR');
const desconto = enriched.fields.find((field) => field.name === 'DESCONTO');
const minimumRule = rules.find((rule) => rule.kind === 'numericMinimum');
const maximumRule = rules.find((rule) => rule.kind === 'numericMaximum');

const checks = [
  minimumRule?.field === 'edtValor',
  minimumRule?.numericValue === 0,
  minimumRule?.exclusive === true,
  maximumRule?.field === 'DESCONTO',
  maximumRule?.numericValue === 50,
  maximumRule?.exclusive === false,
  valor?.numericMinimum?.value === 0 && valor.numericMinimum.exclusive,
  desconto?.numericMaximum?.value === 50 && !desconto.numericMaximum.exclusive,
  valor?.validationMessages.includes('Valor deve ser maior que zero') === true,
  enriched.unmatchedRules.length === 0
];

const passed = checks.filter(Boolean).length;
const report = { ok: passed === checks.length, checks: checks.length, passed, rules, fields: enriched.fields };

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(`NUMERIC_BUSINESS_RULE_ENRICHMENT_${report.ok ? 'OK' : 'ERROR'}:checks=${checks.length}:passed=${passed}`);

if (!report.ok) process.exit(1);
