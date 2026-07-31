# Contrato de dialogs do frontend gerado

O validador `validateGeneratedFrontendDialogs.ts` verifica a estrutura dos dialogs CRUD produzidos pelo gerador frontend.

## Objetivo

Garantir que os fluxos de criação, edição e exclusão sejam renderizados com componentes Material UI controlados, responsivos e coerentes com os estados e mutações da página.

## Execução

A partir de `packages/delphi-parser`:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendDialogs.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para obter um relatório estruturado:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendDialogs.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS \
  --json
```

## Verificações

O contrato confirma:

- importação de `Dialog`, `DialogTitle`, `DialogContent` e `DialogActions`;
- dialog de criação controlado por `isCreating`;
- dialog de edição controlado por `editing`;
- dialog de exclusão controlado por `removing`;
- títulos localizados para os três fluxos CRUD;
- largura responsiva `fullWidth` com `maxWidth="md"` nos formulários;
- largura compacta `maxWidth="xs"` na confirmação;
- ação `Cancelar` na exclusão;
- destaque visual da ação destrutiva;
- bloqueio da exclusão enquanto `remove.isPending` estiver ativo;
- ausência de dialogs com propriedade `open` não controlada.

## Marcador de sucesso

Quando todas as verificações passam, o comando imprime:

```text
FRONTEND_DIALOGS_OK:Produto:checks=16:passed=16
```

## Suíte agregada

O contrato `dialogs` também é executado por `validateFixtureFrontendTabbedForms.ts` para todas as fixtures oficiais.
