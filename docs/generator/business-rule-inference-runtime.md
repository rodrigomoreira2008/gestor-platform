# Inferencia semantica de regras Pascal

## Objetivo

Converter a arvore de fluxo produzida pelo parser Pascal em regras de negocio normalizadas, reutilizaveis pelos geradores frontend, backend e pelo relatorio de migracao.

## Regras reconhecidas inicialmente

- `requiredField`: validacao de campo vazio associada a mensagem e/ou `Abort`;
- `ensureDatasetOpen`: chamada `Dataset.Open`;
- `saveDataset`: chamada `Dataset.Post`;
- `deleteRecord`: chamada `Dataset.Delete`;
- `closeForm`: chamada `Close` ou `Self.Close`;
- `showMessage`: `ShowMessage`, `MessageDlg` ou excecao reconhecida no fluxo;
- `assignment`: atribuicao Pascal com `:=`;
- `customCall`: chamada ainda sem semantica especializada.

## Rastreabilidade

Cada regra conserva:

- metodo de origem;
- identificador do no de fluxo;
- condicao ativa;
- alvo;
- expressao;
- nivel de confianca.

Isso permite gerar codigo e, ao mesmo tempo, explicar de onde cada regra foi extraida.

## Integracao

`resolveDelphiForm` executa `inferBusinessRules(pascal.methodFlows)` e publica o resultado em `ResolvedForm.businessRules`.

## Contrato

Arquivo:

```text
packages/delphi-parser/src/cli/validateBusinessRuleInference.ts
```

Saida esperada:

```text
BUSINESS_RULE_INFERENCE_OK:checks=10:passed=10
```

## Limites atuais

- expressoes ainda sao preservadas como texto Pascal;
- nao ha avaliacao de tipos;
- `case`, loops, `try/except`, `try/finally` e `with` ainda nao possuem semantica especializada;
- chamadas personalizadas permanecem como `customCall` ate receberem mapeamento explicito.
