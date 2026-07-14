# Fixtures do Delphi Parser

Esta pasta contem exemplos sinteticos de telas Delphi usados para validar o fluxo DFM/PAS -> ResolvedForm -> artefatos backend/frontend.

## Fixtures disponiveis

- `cadastro-produtos.dfm` + `cadastro-produtos.pas`: tela com abas, lookup, checkbox e grid detalhe.
- `cadastro-parceiros.dfm` + `cadastro-parceiros.pas`: tela com abas, lookup, checkbox e grid detalhe.
- `cadastro-grupo-produtos.dfm` + `cadastro-grupo-produtos.pas`: CRUD simples sem detalhe.
- `cadastro-grupo-parceiros.dfm` + `cadastro-grupo-parceiros.pas`: CRUD simples sem detalhe.
- `cadastro-pedidos.dfm` + `cadastro-pedidos.pas`: cenario integrado com PageControl, data, valor numerico, lookup de cliente, grid de itens, validacoes Pascal e relacionamento SQL mestre/detalhe.

## Validacao completa

```bash
pnpm validate:delphi-fixtures
```

## Auditoria dos componentes

```bash
pnpm --filter @gestor/delphi-parser validate:components
pnpm --filter @gestor/delphi-parser validate:fixture-components
```

## Validacao de geracao por fixture

```bash
pnpm --filter @gestor/delphi-parser validate:fixture:produtos
pnpm --filter @gestor/delphi-parser validate:fixture:parceiros
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-produtos
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-parceiros
pnpm --filter @gestor/delphi-parser validate:fixture:pedidos
```

## Sintaxe, imports e compilacao frontend

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-syntax
pnpm --filter @gestor/delphi-parser validate:fixture-imports
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-compile
```

A validacao sintatica transpila os arquivos, a auditoria de imports confere o grafo relativo e a compilacao frontend cria um programa TypeScript temporario com todos os artefatos emitidos. O programa usa `strict`, JSX React e resolucao Bundler para detectar incompatibilidades de tipos entre os arquivos gerados. Dependencias externas e pontos de integracao compartilhados permanecem ambientados para que o teste se concentre no modulo produzido.

Para um unico formulario:

```bash
pnpm --filter @gestor/delphi-parser validate:frontend-compile arquivo.dfm arquivo.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:frontend-compile arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

## Determinismo da geracao

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-determinism
pnpm --filter @gestor/delphi-parser validate:determinism arquivo.dfm arquivo.pas Entidade TABELA
```

A validacao resolve e gera o mesmo formulario duas vezes, compara ordem, paths e conteudo, e confirma que os geradores nao alteraram o `ResolvedForm` recebido.

## Contratos backend e frontend

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-contracts
pnpm --filter @gestor/delphi-parser validate:contracts arquivo.dfm arquivo.pas Entidade TABELA
```

A validacao compara o DTO C# com a interface TypeScript gerada, incluindo identidade, nomes e categorias de tipos.

## Persistencia e compilacao backend

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-repository
pnpm --filter @gestor/delphi-parser validate:fixture-backend-compile
```

A auditoria verifica Entity, DTO, Validator, Service, Controller, Configuration e DbContext. A etapa de compilacao materializa os artefatos em um projeto .NET 8 temporario e executa `dotnet build` com warnings tratados como erros.

## Rotas backend e frontend

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-routes
pnpm --filter @gestor/delphi-parser validate:routes arquivo.dfm arquivo.pas Entidade TABELA
```

A validacao compara o `[Route]` do controller, o endpoint CRUD, a rota de pagina e o item de menu.

## Validacao semantica

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-semantic
pnpm --filter @gestor/delphi-parser validate:fixture:pedidos-semantic -- --json
```

A etapa confirma campos, abas, lookup, validacoes, relacionamento mestre/detalhe e trechos essenciais dos artefatos do cenario de pedidos.

## Objetivo dos fixtures

Os fixtures garantem regressao minima em parsing DFM/PAS, inferencias, geracao backend/frontend, sintaxe, imports, compilacao TypeScript, determinismo, contratos, persistencia, compilacao C#, rotas, semantica e cobertura funcional.
