# Enriquecimento de campos por regras de negócio

## Objetivo

Aplicar regras semânticas inferidas do código Pascal aos campos resolvidos do DFM antes da geração de frontend e backend.

A primeira integração cobre regras `requiredField`.

## Fluxo

```text
PAS
  -> PascalMethodFlow
  -> inferBusinessRules
  -> enrichFieldsWithBusinessRules
  -> ResolvedField.required / validationMessages
  -> Zod e validador C#
```

## Correspondência de campos

A correspondência considera:

- nome resolvido;
- `DataField`;
- nome do componente DFM;
- prefixos comuns como `edt`, `dbedt`, `txt`, `cmb`, `lkp`, `mem` e `memo`.

Assim, uma regra associada a `edtNome` pode enriquecer um campo resolvido como `NOME`.

## Efeito nos geradores

Uma regra Pascal como:

```pascal
if edtNome.Text = '' then
begin
  ShowMessage('Informe o nome');
  Abort;
end;
```

faz o campo ser marcado como obrigatório e adiciona a mensagem `Informe o nome`.

O frontend passa a gerar uma validação Zod com `trim().min(1, ...)` e o backend gera uma verificação com `string.IsNullOrWhiteSpace`.

## Rastreabilidade

As regras originais permanecem em `ResolvedForm.businessRules`. Regras obrigatórias sem correspondência no DFM geram warnings explícitos no formulário resolvido.

## Contrato

```text
packages/delphi-parser/src/cli/validateBusinessRuleFieldEnrichment.ts
```

Saída esperada:

```text
BUSINESS_RULE_FIELD_ENRICHMENT_OK:checks=10:passed=10
```

## Limites atuais

- somente `requiredField` altera campos automaticamente;
- regras de intervalo, formato e comparação ainda não são convertidas;
- a correspondência por prefixo é heurística;
- o contrato precisa ser executado para confirmar compilação e comportamento em runtime.
