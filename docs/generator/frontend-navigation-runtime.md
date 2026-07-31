# Validação dos snippets de navegação frontend

O gerador produz dois arquivos auxiliares por entidade:

```text
Generated/<Entidade>Route.tsx.txt
Generated/<Entidade>MenuItem.ts.txt
```

Eles orientam a integração da página gerada às rotas e ao menu principal da aplicação.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendNavigation.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter o relatório estruturado:

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendNavigation.ts \
  arquivo.dfm arquivo.pas Entidade TABELA --json
```

## Contratos verificados

A validação confirma:

- geração dos dois snippets;
- import da página no módulo correto;
- rota em `kebab-case` plural;
- uso da mesma URL na rota e no menu;
- nome correto da página React;
- rótulo do menu correspondente à entidade;
- presença das instruções de integração;
- ausência de `undefined`, `null`, `TODO` e `FIXME`;
- extração bem-sucedida do caminho dos dois arquivos.

## Marcador de sucesso

```text
FRONTEND_NAVIGATION_OK:Produto:path=/produtos:snippets=2
```

## Pipeline

O contrato `navigation` integra a suíte avançada executada por:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

Ele é aplicado aos cinco fixtures e, por consequência, também integra o `validate:all` e o GitHub Actions.
