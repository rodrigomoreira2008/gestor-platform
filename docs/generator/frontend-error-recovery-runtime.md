# Contrato de recuperação de erro do frontend

O gerador produz páginas CRUD com recuperação explícita quando a consulta principal falha.

## Comportamento esperado

Quando `list.isError` estiver ativo, a página deve:

- renderizar um `Alert` com severidade `warning`;
- preservar a mensagem contextual da entidade;
- oferecer a ação `Tentar novamente`;
- executar `list.refetch()` sem remover pesquisa ou filtros;
- bloquear a ação enquanto `list.isFetching` estiver ativo;
- exibir `Tentando...` durante a nova tentativa;
- continuar oferecendo a atualização manual normal na toolbar.

## Validação

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendErrorRecovery.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto PRODUTOS
```

Saída esperada:

```text
FRONTEND_ERROR_RECOVERY_OK:Produto:checks=10:passed=10
```

O contrato também faz parte de `validateFixtureFrontendTabbedForms.ts` e é executado para as cinco fixtures oficiais.
