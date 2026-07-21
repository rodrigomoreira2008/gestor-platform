# Contrato de estado do frontend gerado

O validador `validateGeneratedFrontendState.ts` verifica se a pagina CRUD gerada mantem um modelo de estado local previsivel e coerente para criacao, edicao, exclusao, selecao, pesquisa e filtros.

## Objetivo

Evitar regressões em que dialogs, filtros ou selecao de registros fiquem desacoplados do estado React, ou em que a pagina passe a depender de estado global sem necessidade.

## Uso

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendState.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para obter o relatorio estruturado:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendState.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS \
  --json
```

## Verificacoes

O contrato confirma que:

- `useState` e importado do React;
- os estados `isCreating`, `editing`, `removing`, `selected`, `search` e `filters` existem;
- os dialogs de criacao, edicao e exclusao sao controlados pelos estados correspondentes;
- operacoes bem-sucedidas limpam ou fecham o estado transitorio;
- a exclusao do registro selecionado limpa `selected`;
- pesquisa e filtros sao componentes controlados;
- o clique em uma linha atualiza o registro selecionado;
- a pagina CRUD simples nao depende de Redux, Zustand, MobX ou Recoil.

## Marcador de sucesso

Uma validacao bem-sucedida produz um marcador semelhante a:

```text
FRONTEND_STATE_OK:Produto:checks=17:passed=17
```

## Suite agregada

O contrato `state` faz parte de `validateFixtureFrontendTabbedForms.ts` e e executado para todas as fixtures oficiais.
