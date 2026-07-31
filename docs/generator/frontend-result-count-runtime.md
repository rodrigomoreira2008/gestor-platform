# Contrato runtime de contagem de resultados

Este contrato valida a comparação entre os registros atualmente exibidos e o total carregado pela consulta.

## Comportamento esperado

A página gerada deve:

- calcular `totalRecords` a partir de `list.data ?? []`;
- manter `rows.length` como quantidade resultante de pesquisa e filtros;
- exibir `Registros exibidos: X de Y`;
- preservar a memoização da coleção filtrada;
- manter o contador de filtros ativos.

## Validador

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendResultCount.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Saída esperada:

```text
FRONTEND_RESULT_COUNT_OK:Produto:checks=9:passed=9
```

O contrato também faz parte de `validateFixtureFrontendTabbedForms.ts` e é executado para as cinco fixtures oficiais.
