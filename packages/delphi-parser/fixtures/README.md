# Fixtures do Delphi Parser

Esta pasta contem exemplos sinteticos de telas Delphi usados para validar o fluxo DFM/PAS -> ResolvedForm -> artefatos backend/frontend.

## Fixtures disponiveis

- `cadastro-produtos.dfm` + `cadastro-produtos.pas`: tela com abas, lookup, checkbox e grid detalhe.
- `cadastro-parceiros.dfm` + `cadastro-parceiros.pas`: tela com abas, lookup, checkbox e grid detalhe.
- `cadastro-grupo-produtos.dfm` + `cadastro-grupo-produtos.pas`: CRUD simples sem detalhe.
- `cadastro-grupo-parceiros.dfm` + `cadastro-grupo-parceiros.pas`: CRUD simples sem detalhe.
- `cadastro-pedidos.dfm` + `cadastro-pedidos.pas`: cenario integrado com PageControl, data, valor numerico, lookup de cliente, grid de itens, validacoes Pascal e relacionamento SQL mestre/detalhe.

## Validacao completa

Rodar catalogo, auditoria estrutural dos DFM, geracao e validacao semantica:

```bash
pnpm validate:delphi-fixtures
```

## Auditoria dos componentes

Validar somente o catalogo de mapeamentos:

```bash
pnpm --filter @gestor/delphi-parser validate:components
```

Auditar os componentes usados pelos cinco DFM com modo estrito:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-components
```

Essa auditoria falha quando houver classe desconhecida ou warning estrutural no parser DFM.

## Validacao de geracao por fixture

```bash
pnpm --filter @gestor/delphi-parser validate:fixture:produtos
pnpm --filter @gestor/delphi-parser validate:fixture:parceiros
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-produtos
pnpm --filter @gestor/delphi-parser validate:fixture:grupo-parceiros
pnpm --filter @gestor/delphi-parser validate:fixture:pedidos
```

Esses comandos verificam a geracao estrutural dos artefatos backend e frontend de cada fixture.

## Sintaxe e grafo de imports

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-syntax
pnpm --filter @gestor/delphi-parser validate:fixture-imports
```

A validacao sintatica transpila todos os arquivos TypeScript e TSX gerados. A validacao de imports resolve cada import relativo contra o conjunto de arquivos emitidos e falha em imports ausentes, autorreferencias ou diferencas de maiusculas e minusculas. Imports para a infraestrutura compartilhada da aplicacao sao contabilizados separadamente como pontos de integracao.

Para validar um unico formulario:

```bash
pnpm --filter @gestor/delphi-parser validate:imports arquivo.dfm arquivo.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:imports arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

## Validacao semantica

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-semantic
pnpm --filter @gestor/delphi-parser validate:fixture:pedidos-semantic -- --json
```

A etapa semantica roda separadamente depois da geracao estrutural. Ela confirma que o fixture de pedidos preserva campos, abas, lookup, validacoes, relacionamento mestre/detalhe e trechos essenciais dos artefatos gerados.

A separacao permite identificar no CI se a regressao ocorreu na estrutura geral dos arquivos ou no significado inferido a partir do Delphi.

O fixture de pedidos concentra, em um unico caso, as principais inferencias que precisam permanecer integradas: abas, lookup remoto, tipos de campo, mensagens de validacao, relacionamento SQL e grid mestre/detalhe.

## Objetivo dos fixtures

Os fixtures foram criados para garantir regressao minima em:

- integridade do catalogo de componentes;
- parsing estrutural DFM sem warnings;
- ausencia de classes Delphi desconhecidas nos fixtures;
- parsing PAS;
- inferencia de SQL, tabelas, joins e relacionamentos;
- inferencia de lookups;
- inferencia de tabs;
- inferencia de grids detalhe;
- geracao backend;
- geracao frontend;
- sintaxe TypeScript e TSX;
- integridade do grafo de imports gerado;
- validacao combinada de artefatos;
- validacao semantica do cenario integrado de pedidos.
