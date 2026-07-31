# Contrato React Query do frontend gerado

O executor `validateGeneratedFrontendReactQuery.ts` verifica se os hooks CRUD gerados permanecem integrados à infraestrutura compartilhada de cache e mutações.

## Objetivo

Evitar que cada módulo gerado recrie configurações do TanStack Query, chaves de cache ou políticas de invalidação. O frontend gerado deve delegar essas decisões ao helper compartilhado `useCrudResource`.

## Verificações

O contrato confirma:

- importação de `useCrudResource` da infraestrutura compartilhada;
- tipagem do recurso com a entidade e seu tipo de entrada;
- chave raiz estável em kebab-case;
- existência de uma única fábrica de recurso por entidade;
- reutilização dessa fábrica pelos hooks de listagem, criação, alteração e exclusão;
- ausência de acoplamento direto a `@tanstack/react-query` nos hooks gerados;
- ausência de `queryKey` duplicada no módulo gerado;
- uso de `createCrudApi` na camada de API;
- exportação do objeto de API consumido pela fábrica de hooks.

## Uso

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendReactQuery.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para saída estruturada:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendReactQuery.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS \
  --json
```

## Marcador de sucesso

```text
FRONTEND_REACT_QUERY_OK:Produto:checks=12:passed=12
```

## Integração

O contrato `react-query` faz parte da suíte `validateFixtureFrontendTabbedForms.ts` e é executado para todas as fixtures oficiais.
