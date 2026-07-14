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

## Determinismo da geracao

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-determinism
```

Para um unico formulario:

```bash
pnpm --filter @gestor/delphi-parser validate:determinism arquivo.dfm arquivo.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:determinism arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

A validacao resolve e gera o mesmo formulario duas vezes. Ela compara a ordem, os paths e o conteudo de todos os artefatos backend e frontend, produz hashes SHA-256 resumidos e confirma que os geradores nao alteraram o `ResolvedForm` recebido. Isso evita diffs instaveis causados por ordem nao deterministica, estado global ou mutacao acidental.

## Contratos backend e frontend

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-contracts
```

Para validar um unico formulario:

```bash
pnpm --filter @gestor/delphi-parser validate:contracts arquivo.dfm arquivo.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:contracts arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

A validacao compara o DTO C# com a interface TypeScript gerada. Ela normaliza nomes PascalCase/camelCase, confirma a identidade numerica e verifica a compatibilidade das categorias `string`, `number`, `boolean` e `date`. O comando falha quando um campo existe apenas em uma camada ou quando os tipos gerados divergem.

## Persistencia backend

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-repository
```

Para validar um unico formulario:

```bash
pnpm --filter @gestor/delphi-parser validate:repository arquivo.dfm arquivo.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:repository arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

A auditoria verifica Entity, DTO, Validator, Service, Controller, EntityConfiguration e o snippet de registro do DbContext. Ela compara propriedades, tipos, mapeamentos do Service, colunas configuradas, `DbSet<TEntity>`, `ApplyConfiguration` e os contratos genericos utilizados pelas classes. O comando falha em campos ausentes, tipos divergentes, propriedades duplicadas ou referencias inconsistentes entre as camadas.

## Rotas backend e frontend

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-routes
```

Para validar um unico formulario:

```bash
pnpm --filter @gestor/delphi-parser validate:routes arquivo.dfm arquivo.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:routes arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

A validacao compara o atributo `[Route]` do controller C# com o endpoint usado por `createCrudApi` no frontend. Ela tambem verifica se o snippet de rota da pagina corresponde ao item de menu, se o endpoint usa o prefixo `/api/`, se nao possui barras duplicadas e se a rota visual nao aponta acidentalmente para a API.

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
- determinismo dos modelos e artefatos gerados;
- ausencia de mutacao do `ResolvedForm` pelos geradores;
- compatibilidade entre DTO C# e tipos TypeScript;
- consistencia da camada Entity/DTO/Validator/Service/Controller/Configuration/DbContext;
- consistencia entre endpoints CRUD, rotas de pagina e itens de menu;
- validacao combinada de artefatos;
- validacao semantica do cenario integrado de pedidos.
