# Release notes do Gerador Delphi

## Feature branch: feature/delphi-pas-parser

Esta versao adiciona a primeira base integrada do gerador Delphi DFM/PAS para Web.

## Adicionado

- Parser PAS com extracao de metodos, SQL, validacoes, datasets e eventos.
- Modelo intermediario ResolvedForm enriquecido.
- Inferencia de banco, tabelas, joins, relacionamentos, lookups, tabs e grids detalhe.
- Gerador backend ASP.NET Core.
- Gerador frontend React/MUI.
- Relatorio de migracao em Markdown.
- Validadores CLI para backend, frontend e artefatos combinados.
- Fixtures de Produtos, Parceiros, Grupo de Produtos e Grupo de Parceiros.
- Workflow CI para validar fixtures.
- Documentacao completa do fluxo do gerador.

## Validacao

Comandos principais:

```bash
pnpm --filter @gestor/delphi-parser build
pnpm validate:delphi-fixtures
```

## Compatibilidade

A geracao atual e heuristica e deve ser tratada como acelerador de migracao, nao como substituto de revisao tecnica.

## Revisao obrigatoria

Antes de aplicar em producao, revisar:

- tipos inferidos;
- campos obrigatorios;
- lookups;
- relacionamentos;
- grids detalhe;
- endpoints;
- snippets de rota e menu;
- DbContext e migrations.
