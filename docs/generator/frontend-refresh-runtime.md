# Contrato de atualização manual do frontend

O frontend gerado oferece uma ação explícita para atualizar a listagem sem perder o contexto atual da página.

## Objetivo

Permitir que o usuário solicite uma nova leitura da API mantendo pesquisa, filtros, paginação e seleção sob responsabilidade dos componentes existentes.

## Comportamento gerado

A toolbar da página inclui o botão `Atualizar`, acompanhado do ícone `Refresh`.

Ao acionar o botão:

- `list.refetch()` é executado;
- a pesquisa global é preservada;
- os filtros avançados são preservados;
- o botão fica desabilitado enquanto `list.isFetching` estiver ativo;
- o texto muda temporariamente para `Atualizando...`;
- não são criadas chamadas duplicadas de atualização.

A ação utiliza `isFetching`, e não apenas `isLoading`, para representar corretamente atualizações em segundo plano após a primeira carga.

## Ordem da toolbar

As ações geradas aparecem na seguinte ordem:

1. Atualizar;
2. Limpar filtros;
3. Exportar CSV;
4. Novo.

## Validação

O contrato é validado por:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendRefresh.ts
```

Execução individual:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendRefresh.ts fixtures/cadastro-produtos.dfm fixtures/cadastro-produtos.pas Produto PRODUTOS
```

Marcador esperado:

```text
FRONTEND_REFRESH_OK:Produto:checks=10:passed=10
```

O validador também integra a suíte agregada das cinco fixtures oficiais.
