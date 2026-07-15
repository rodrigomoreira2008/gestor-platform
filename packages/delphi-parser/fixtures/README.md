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

## Seguranca e integridade dos caminhos

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-paths
pnpm --filter @gestor/delphi-parser validate:paths arquivo.dfm arquivo.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:paths arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

A auditoria de caminhos e executada antes de qualquer compilacao. Ela impede caminhos absolutos, `..`, barras invertidas, caracteres NUL, extensoes inesperadas, arquivos fora das raizes `apps/backend` e `apps/frontend`, caminhos nao normalizados e colisoes que apareceriam apenas em sistemas de arquivos sem diferenciacao entre maiusculas e minusculas.

## Placeholders e orcamentos de geracao

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-placeholders
pnpm --filter @gestor/delphi-parser validate:fixture-budgets
pnpm --filter @gestor/delphi-parser validate:budgets arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

A auditoria de placeholders detecta conflitos Git, templates nao resolvidos, `undefined`, `[object Object]` e marcadores `FIXME`. A validacao de orcamentos impede crescimento acidental da saida: no maximo 100 arquivos por camada, 256 KiB e 5000 linhas por arquivo, 2 MiB e 30000 linhas no conjunto backend/frontend. A saida informa totais separados por camada e o arquivo exato que excedeu um limite.

## Formato textual dos artefatos

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-text-format
pnpm --filter @gestor/delphi-parser validate:text-format arquivo.dfm arquivo.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:text-format arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

A validacao garante arquivos sem BOM, somente com quebras de linha LF, sem espacos finais, sem caracteres de controle inesperados e com exatamente um newline ao final. Isso evita diffs artificiais entre Windows e Linux e mantem os artefatos prontos para formatadores e compiladores.

## Convencoes, fronteiras, recursos, privacidade, rede e seguranca

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-names
pnpm --filter @gestor/delphi-parser validate:fixture-boundaries
pnpm --filter @gestor/delphi-parser validate:boundaries arquivo.dfm arquivo.pas Entidade TABELA -- --json
```

A auditoria de fronteiras impede que o backend gere referencias para React, TypeScript, `node_modules` ou arquivos frontend. No sentido inverso, impede imports frontend para C#, namespaces `System`/`Microsoft`, caminhos do backend e APIs nativas do Node como `fs`, `path`, `child_process` e `node:*`.

A mesma etapa detecta segredos literais, caracteres Unicode invisiveis, problemas basicos de acessibilidade e padroes de execucao perigosos. No backend, bloqueia inicializacao de processos e shells, bibliotecas nativas, desserializadores inseguros e SQL bruto interpolado ou concatenado. No frontend, bloqueia `eval`, `new Function`, `dangerouslySetInnerHTML`, `document.write`, atribuicoes a `innerHTML` e URLs `javascript:`. Cada violacao informa camada, arquivo, linha, regra e referencia detectada; valores sensiveis sao parcialmente ocultados.

A auditoria de saida de rede bloqueia URLs externas literais, `WebRequest`, sockets diretos, WebSocket, EventSource e `navigator.sendBeacon`. Enderecos relativos e `localhost` permanecem permitidos para a API gerada e para desenvolvimento local. O relatorio JSON separa `networkRules` e `networkCount` das demais categorias de seguranca.

A auditoria de privacidade impede persistencia direta em `localStorage`, `sessionStorage`, IndexedDB e cookies do navegador. Tambem detecta dados pessoais ou credenciais em logs, query strings e URLs, alem de cookies backend explicitamente configurados sem `HttpOnly` ou `Secure`. O relatorio JSON separa `privacyRules` e `privacyCount`.

A auditoria de recursos detecta loops infinitos, bloqueio de threads, `Task.Run` introduzido pelo gerador, materializacao de consultas sem limite, intervalos globais, animation frames e Web Workers. O relatorio JSON apresenta `resourceRules` e `resourceCount`, mantendo esses riscos separados das demais categorias.

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

Os fixtures garantem regressao minima em parsing DFM/PAS, inferencias, geracao backend/frontend, seguranca dos caminhos, placeholders, orcamentos de tamanho, formato textual, convencoes de nomes, fronteiras de camada, segredos, Unicode perigoso, dependencias permitidas, acessibilidade, saida de rede, privacidade, consumo de recursos, padroes de execucao insegura, sintaxe, imports, compilacao TypeScript, determinismo, contratos, persistencia, compilacao C#, rotas, semantica e cobertura funcional.
