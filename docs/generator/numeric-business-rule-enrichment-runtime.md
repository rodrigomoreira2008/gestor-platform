# Numeric business rule enrichment

The Pascal intelligence pipeline now converts numeric rejection conditions into normalized field constraints.

Supported initial patterns include controls and datasets:

```pascal
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
```

The first condition produces an exclusive minimum of `0`. The second produces an inclusive maximum of `50`. The comparison describes the invalid branch, so the inferred constraint is its valid complement.

Each numeric rule records the field, boundary value, exclusivity, message, confidence, condition and source flow node. `enrichFieldsWithBusinessRules` attaches the normalized constraint to `ResolvedField.numericMinimum` or `ResolvedField.numericMaximum` and preserves the original message in `validationMessages`.

The field matcher supports direct DFM/data-field names and common Delphi control prefixes such as `edt`, `dbedt`, `txt`, `cmb`, `lkp` and `memo`.

Validation contract:

```text
packages/delphi-parser/src/cli/validateNumericBusinessRuleEnrichment.ts
```

Expected marker:

```text
NUMERIC_BUSINESS_RULE_ENRICHMENT_OK:checks=10:passed=10
```

Current limitations:

- only literal numeric boundaries are inferred;
- compound boolean expressions are not decomposed;
- arithmetic expressions and variable-based limits remain for later analysis;
- the contract must still be executed by the package validation workflow.
