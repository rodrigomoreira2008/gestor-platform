# Fixtures do Delphi Parser

Esta pasta contem exemplos sinteticos de telas Delphi usados para validar o fluxo DFM/PAS -> ResolvedForm -> artefatos backend/frontend.

## Fixtures disponiveis

- `cadastro-produtos.dfm` + `cadastro-produtos.pas`: tela com abas, lookup, checkbox e grid detalhe.
- `cadastro-parceiros.dfm` + `cadastro-parceiros.pas`: tela com abas, lookup, checkbox e grid detalhe.
- `cadastro-grupo-produtos.dfm` + `cadastro-grupo-produtos.pas`: CRUD simples sem detalhe.
- `cadastro-grupo-parceiros.dfm` + `cadastro-grupo-parceiros.pas`: CRUD simples sem detalhe.

## Validacao

Rodar todos os fixtures:

```bash
pnpm validate:delphi-fixtures
```

Rodar fixture especifico:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture:produtos
pnpm --filter @gestor/delphi-parser validate:fixture:parceiros
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-produtos
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-parceiros
```

## Objetivo dos fixtures

Os fixtures foram criados para garantir regressao minima em:

- parsing DFM;
- parsing PAS;
- inferencia de SQL, tabelas, joins e relacionamentos;
- inferencia de lookups;
- inferencia de tabs;
- inferencia de grids detalhe;
- geracao backend;
- geracao frontend;
- validacao combinada de artefatos.
