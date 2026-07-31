# CLI de frontend com ações Delphi

O comando `gen:frontend` pode gerar somente o CRUD padrão ou incluir os artefatos que preservam os eventos e métodos inferidos do Delphi.

## Geração padrão

```bash
pnpm --filter @gestor/delphi-parser gen:frontend produto.dfm produto.pas Produto PRODUTOS apps/frontend/src/modules/produtos
```

## Geração com ações Delphi

```bash
pnpm --filter @gestor/delphi-parser gen:frontend produto.dfm produto.pas Produto PRODUTOS apps/frontend/src/modules/produtos --delphi-actions
```

Essa variante também gera:

- `delphi/produtoDelphiActions.ts`
- `delphi/useProdutoDelphiRuntime.ts`
- `delphi/useProdutoDelphiActionController.ts`
- `delphi/ProdutoDelphiDialogController.tsx`
- `pages/ProdutoDelphiPage.tsx`
- snippets de rota e seleção de página

## Caminho e alias de rota

As opções de rota exigem `--delphi-actions`:

```bash
pnpm --filter @gestor/delphi-parser gen:frontend produto.dfm produto.pas Produto PRODUTOS apps/frontend/src/modules/produtos --delphi-actions --route-path=/cadastros/produtos --route-export-alias=produtoRoute
```

Também é aceita a forma com valor separado:

```bash
--route-path /cadastros/produtos --route-export-alias produtoRoute
```

Valores de opções não são interpretados como argumentos posicionais. Opções desconhecidas e opções sem valor produzem erro explícito.

## Compatibilidade

Sem `--delphi-actions`, o comando continua usando `generateFrontendFiles`. Com a flag, passa a usar `generateFrontendFilesWithDelphiActions` e encaminha `outputRoot`, `routePath` e `routeExportAlias`.
