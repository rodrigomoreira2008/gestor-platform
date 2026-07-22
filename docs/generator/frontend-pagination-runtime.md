# Contrato de paginação do frontend gerado

O validador `validateGeneratedFrontendPagination.ts` protege a configuração de paginação e seleção das páginas CRUD produzidas pelo gerador Delphi.

## Objetivo

Garantir que toda página gerada ofereça paginação previsível, preserve a filtragem no cliente e mantenha a seleção de registros independente dos botões de ação da grade.

## Regras verificadas

- a página da entidade deve existir;
- a página deve renderizar `DataGrid`;
- os tamanhos de página permitidos devem ser 10, 25 e 50 registros;
- o tamanho inicial deve ser 10 registros;
- a grade deve consumir a coleção filtrada `rows`;
- a grade deve utilizar as colunas memoizadas `columns`;
- o estado de carregamento deve refletir `list.isLoading`;
- `disableRowSelectionOnClick` deve permanecer habilitado;
- o clique em uma linha deve atualizar `selected`;
- a quantidade de registros exibidos deve usar `rows.length`;
- a filtragem deve ocorrer antes da paginação visual da grade;
- o índice da página não pode ser fixado estaticamente.

## Execução

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendPagination.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS
```

Para saída estruturada:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendPagination.ts \
  fixtures/cadastro-produtos.dfm \
  fixtures/cadastro-produtos.pas \
  Produto \
  PRODUTOS \
  --json
```

## Marcador de sucesso

```text
FRONTEND_PAGINATION_OK:Produto:checks=12:passed=12
```

O contrato também é executado pela suíte `validateFixtureFrontendTabbedForms.ts` para todas as fixtures oficiais.
