# Frontend paused query runtime

A camada `frontendPausedQueryGenerator` diferencia uma consulta pausada por indisponibilidade de rede de um erro definitivo ou de dados apenas obsoletos.

## Comportamento gerado

- observa `list.fetchStatus === 'paused'` do React Query;
- exibe um `Chip` com o texto `Sem conexão`;
- usa apresentação de erro em modo contornado;
- inclui o rótulo acessível `Consulta pausada aguardando conexão`;
- preserva os dados já carregados;
- oculta o indicador `Dados em cache` enquanto a consulta estiver pausada;
- mantém atualização manual, recuperação de erro e progresso em segundo plano.

## Validação

Execute:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendPausedQuery.ts fixtures/cadastro-produtos.dfm fixtures/cadastro-produtos.pas Produto PRODUTOS
```

Saída esperada:

```text
FRONTEND_PAUSED_QUERY_OK:Produto:checks=10:passed=10
```

O contrato também faz parte de `validateFixtureFrontendTabbedForms.ts` para todas as fixtures oficiais.
