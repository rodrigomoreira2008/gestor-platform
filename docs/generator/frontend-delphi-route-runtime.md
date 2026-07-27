# Rotas para páginas orientadas pelo Delphi

O gerador `frontendDelphiRouteGenerator.ts` produz snippets de rota para a página React que preserva os eventos e métodos migrados do Delphi.

## API principal

```ts
renderFrontendDelphiRouteSnippet({
  entityPascal: 'Produto',
  plural: 'produtos'
});
```

A saída importa `ProdutoDelphiPage` e exporta um objeto de rota reutilizável.

```tsx
import { ProdutoDelphiPage } from '../modules/produtos/pages/ProdutoDelphiPage';

export const produtoDelphiRoute = {
  path: '/produtos',
  element: <ProdutoDelphiPage />
};
```

## Caminho customizado

A opção `routePath` permite registrar a tela em uma hierarquia específica:

```ts
renderFrontendDelphiRouteSnippet({
  entityPascal: 'Produto',
  plural: 'produtos',
  routePath: '/cadastros/produtos/'
});
```

O caminho é normalizado para:

```text
/cadastros/produtos
```

## Alias customizado

A opção `exportAlias` altera o nome do objeto exportado:

```ts
renderFrontendDelphiRouteSnippet({
  entityPascal: 'Produto',
  plural: 'produtos',
  exportAlias: 'produtoRoute'
});
```

## Migração gradual

`renderFrontendPageSelectionSnippet()` documenta as duas alternativas:

- `ProdutoPage`: CRUD genérico;
- `ProdutoDelphiPage`: execução dos planos inferidos do Pascal.

Isso permite ativar a nova página por módulo, sem remover a página CRUD padrão.

## Arquivos gerados

A geração composta adiciona:

```text
Generated/ProdutoDelphiRoute.tsx.txt
Generated/ProdutoPageSelection.tsx.txt
```

## Contrato

O contrato `validateFrontendDelphiRouteGenerator.ts` verifica import, alias, normalização do caminho, página Delphi e snippet de migração gradual.

Saída esperada:

```text
FRONTEND_DELPHI_ROUTE_GENERATOR_OK:checks=10:passed=10
```
