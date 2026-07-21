# Contrato de mutações do frontend gerado

O validador `validateGeneratedFrontendMutations.ts` verifica o ciclo de vida das operações de criação, alteração e exclusão produzidas pelo gerador de frontend.

## Objetivo

Garantir que as páginas CRUD geradas:

- usem os hooks de mutação corretos;
- enviem os argumentos esperados para cada operação;
- reflitam o estado pendente na interface;
- fechem dialogs somente após sucesso;
- limpem estados locais relacionados após exclusão;
- não disparem mutações sem callbacks de ciclo de vida.

## Uso

A partir de `packages/delphi-parser`:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendMutations.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Saída estruturada:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendMutations.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS \
  --json
```

## Verificações

O contrato valida a presença de:

1. `useCreate<Entidade>`;
2. `useUpdate<Entidade>`;
3. `useRemove<Entidade>`;
4. `create.mutate(input, ...)`;
5. `update.mutate({ id, input }, ...)`;
6. `remove.mutate(id, ...)`;
7. callbacks `onSuccess` para fechamento dos dialogs;
8. `isPending` nos controles de submissão;
9. limpeza da seleção quando o registro removido estava selecionado.

## Marcador de sucesso

```text
FRONTEND_MUTATIONS_OK:Produto:checks=14:passed=14
```

O validador também integra a suíte `validateFixtureFrontendTabbedForms.ts`, sendo executado para todas as fixtures oficiais.
