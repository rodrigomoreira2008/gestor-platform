# Contrato de pesquisa do frontend gerado

O validador `validateGeneratedFrontendSearch.ts` confirma que a pagina CRUD gerada oferece pesquisa global previsivel e integrada aos filtros avancados.

## Garantias verificadas

- estado textual controlado para a pesquisa;
- campo de pesquisa conectado ao estado React;
- placeholder explicito para pesquisa global;
- icone de pesquisa no inicio do campo;
- normalizacao do termo com `trim()` e `toLocaleLowerCase('pt-BR')`;
- derivacao dos campos pesquisaveis a partir das definicoes de filtros;
- comparacao textual sem diferenca entre maiusculas e minusculas;
- termo vazio preservando todos os registros;
- composicao entre pesquisa global e filtros avancados;
- dependencia correta da memoizacao dos registros;
- entrega da colecao filtrada ao `DataGrid`.

## Execucao

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendSearch.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para saida estruturada:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendSearch.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS \
  --json
```

## Marcador de sucesso

```text
FRONTEND_SEARCH_OK:Produto:checks=12:passed=12
```

O contrato tambem faz parte de `validateFixtureFrontendTabbedForms.ts`, sendo executado para todas as fixtures oficiais.
