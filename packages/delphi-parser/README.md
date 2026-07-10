# @gestor/delphi-parser

Ferramenta de migracao assistida de formularios Delphi DFM/PAS para artefatos Web modernos.

## Fluxo principal

```text
DFM + PAS
  -> parse
  -> ResolvedForm
  -> validacao
  -> backend ASP.NET Core
  -> frontend React/MUI
  -> relatorio de migracao
```

## Instalacao

Na raiz do monorepo:

```bash
pnpm install
pnpm --filter @gestor/delphi-parser build
```

## Ajuda e diagnostico

```bash
pnpm --filter @gestor/delphi-parser help
pnpm --filter @gestor/delphi-parser doctor
pnpm --filter @gestor/delphi-parser doctor --json
```

O comando `doctor` verifica a versao do Node.js, o diretorio de execucao e a presenca dos arquivos essenciais do pacote. Ele tambem faz parte de `validate:all`.

## Analise

```bash
pnpm --filter @gestor/delphi-parser parse:dfm tela.dfm
pnpm --filter @gestor/delphi-parser parse:pas tela.pas
pnpm --filter @gestor/delphi-parser analyze:components tela.dfm
pnpm --filter @gestor/delphi-parser resolve:form tela.dfm tela.pas Entidade TABELA
```

## Geracao

```bash
pnpm --filter @gestor/delphi-parser gen:backend tela.dfm tela.pas Entidade TABELA saida/backend
pnpm --filter @gestor/delphi-parser gen:frontend tela.dfm tela.pas Entidade TABELA saida/frontend
pnpm --filter @gestor/delphi-parser gen:report tela.dfm tela.pas Entidade TABELA saida/relatorio.md
```

## Validacao

```bash
pnpm --filter @gestor/delphi-parser validate:generated tela.dfm tela.pas Entidade TABELA
pnpm --filter @gestor/delphi-parser validate:all
```

`validate:all` executa diagnostico do ambiente, build, validacao do catalogo de componentes, auditoria estrutural dos fixtures e validacao dos artefatos gerados.

## Estrutura

- `src/dfmParser.ts`: parser DFM textual;
- `src/pasParser.ts`: parser PAS;
- `src/resolveForm.ts`: consolidacao no modelo intermediario;
- `src/componentMapping.ts`: catalogo de componentes Delphi;
- `src/backendGenerator.ts`: gerador ASP.NET Core;
- `src/frontendGenerator.ts`: gerador React/MUI;
- `src/migrationReportGenerator.ts`: relatorio de migracao;
- `src/cli`: comandos de linha de comando;
- `fixtures`: telas sinteticas usadas na validacao.

## Limites atuais

A geracao usa heuristicas. Lookups, relacionamentos, grids detalhe, tipos inferidos, rotas, menus, DbContext e migrations devem passar por revisao tecnica antes de uso em producao.

## Documentacao complementar

Consulte `docs/generator/index.md` na raiz do repositorio.
