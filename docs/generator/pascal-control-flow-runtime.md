# Pascal control-flow runtime

## Objetivo

Representar a sequência e a hierarquia inicial das regras encontradas em cada método Delphi, preservando blocos condicionais em vez de produzir somente pistas independentes.

## Modelo

O parser expõe `PascalMethodFlow`, contendo o nome do método, nós de fluxo e avisos. Cada `PascalFlowNode` pode representar:

- `if`;
- `else`;
- `assignment`;
- `call`;
- `abort`;
- `message`;
- `unknown`.

Nós condicionais armazenam ações do ramo principal em `children` e o ramo alternativo em `alternate`.

## Exemplo

```pascal
if edtNome.Text = '' then
begin
  ShowMessage('Informe o nome');
  Abort;
end
else
begin
  qryProduto.Post;
end;
```

A estrutura produzida mantém a condição, a mensagem e o aborto no ramo principal, além da chamada `qryProduto.Post` no ramo alternativo.

## Integração

Os fluxos são retornados em `PascalParseResult.methodFlows` e propagados para `ResolvedForm.methodFlows`. Os antigos `ruleHints` continuam disponíveis para compatibilidade com consumidores existentes.

## Contrato

O contrato sintético está em:

```text
packages/delphi-parser/src/cli/validatePascalControlFlow.ts
```

Saída esperada:

```text
PASCAL_CONTROL_FLOW_OK:checks=10:passed=10
```

## Limites atuais

Esta primeira versão é orientada a linhas e blocos `begin/end`. Ainda não representa completamente `case`, loops, `try/except`, `try/finally`, expressões multilinha, diretivas condicionais ou todas as formas válidas da linguagem Pascal.
