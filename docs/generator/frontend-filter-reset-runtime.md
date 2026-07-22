# Contrato de limpeza de filtros do frontend

Este contrato valida que as páginas CRUD geradas oferecem uma ação explícita para restaurar, em conjunto, a pesquisa global e os filtros avançados.

## Objetivo

Evitar que o usuário precise limpar cada controle manualmente e garantir que a coleção exibida possa retornar ao estado integral de forma previsível.

## Comportamento gerado

A página inclui o handler `clearFilters`, responsável por:

- limpar o termo de pesquisa com `setSearch('')`;
- restaurar os filtros avançados com `setFilters({})`;
- reutilizar `hasActiveFilters` para controlar a disponibilidade da ação;
- bloquear a ação durante o carregamento da listagem.

A toolbar apresenta as ações nesta ordem:

1. Limpar filtros;
2. Exportar CSV;
3. Novo.

A ação usa o ícone `FilterAltOff` e fica desabilitada quando não existe pesquisa ou filtro ativo.

## Validador

Arquivo:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendFilterReset.ts
```

Execução direta:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendFilterReset.ts fixtures/cadastro-produtos.dfm fixtures/cadastro-produtos.pas Produto PRODUTOS
```

Marcador esperado:

```text
FRONTEND_FILTER_RESET_OK:Produto:checks=12:passed=12
```

## Integração

O contrato `filter-reset` integra `validateFixtureFrontendTabbedForms.ts` e é executado para todas as cinco fixtures oficiais.
