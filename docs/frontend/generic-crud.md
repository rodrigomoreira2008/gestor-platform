# Frontend: CRUD Genérico

## Objetivo

Padronizar o acesso a APIs REST e o uso de React Query para os cadastros migrados do GestorLoc.

Com essa base, novos módulos podem ser conectados ao backend com pouco código repetido.

## `createCrudApi<TItem, TInput>`

Factory para criar clientes REST padronizados.

```ts
export const produtoApi = createCrudApi<Produto, ProdutoInput>('/api/produtos');
```

A factory gera métodos para:

- `getAll`
- `getById`
- `create`
- `update`
- `remove`

## `useCrudResource<TItem, TInput>`

Hook genérico baseado em React Query.

Ele retorna:

- `list`
- `create`
- `update`
- `remove`

Cada mutation invalida automaticamente a query principal do recurso.

## Exemplo: Produto

```ts
export const produtoApi = createCrudApi<Produto, ProdutoInput>('/api/produtos');

export function useProdutoResource() {
  return useCrudResource<Produto, ProdutoInput>('produtos', produtoApi);
}
```

Os hooks específicos continuam existindo por compatibilidade e clareza:

```ts
useProdutos()
useCreateProduto()
useUpdateProduto()
useRemoveProduto()
```

## Benefício para a migração

Para cada novo cadastro gerado, o frontend precisará criar principalmente:

- tipos TypeScript;
- API via `createCrudApi`;
- hook via `useCrudResource`;
- página React baseada na DSL;
- componente de lista ou grid.

Isso reduz a repetição e deixa Clientes, Fornecedores, Contratos, Estoque e outros módulos seguindo o mesmo padrão do piloto Produto.
