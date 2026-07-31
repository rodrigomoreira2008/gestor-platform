# Contrato runtime: contador de filtros ativos

O frontend gerado apresenta a quantidade de critérios ativos diretamente na ação `Limpar filtros`.

## Comportamento esperado

- a pesquisa global contribui com uma unidade quando contém texto após `trim()`;
- cada filtro avançado não vazio contribui com uma unidade;
- o total é exibido em um `Badge` do Material UI;
- o badge fica invisível quando o total é zero;
- a contagem é recalculada a cada mudança da pesquisa ou dos filtros;
- a ação `Limpar filtros` zera pesquisa, filtros avançados e, consequentemente, o contador.

## Validador

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendActiveFilterCount.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Marcador de sucesso:

```text
FRONTEND_ACTIVE_FILTER_COUNT_OK:Produto:checks=10:passed=10
```

O contrato também faz parte de `validateFixtureFrontendTabbedForms.ts` e é executado para todas as fixtures oficiais.
