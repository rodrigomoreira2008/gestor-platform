# Validação do encadeamento frontend gerado

O executor `validateGeneratedFrontendWiring.ts` verifica se os módulos frontend produzidos pelo gerador estão conectados entre si por imports válidos.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendWiring.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter o relatório estruturado:

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendWiring.ts \
  arquivo.dfm arquivo.pas Entidade TABELA --json
```

## Contratos verificados

A validação percorre a AST dos arquivos `.ts` e `.tsx` e confirma:

- resolução de todos os imports relativos para arquivos realmente gerados;
- ausência de autoimports;
- bloqueio de dependências externas não autorizadas;
- autorização explícita para React, Material UI, React Query e Zod;
- ligação da API aos tipos;
- ligação dos hooks à API e aos tipos;
- ligação da página aos hooks, colunas e tipos;
- ligação do formulário com abas ao schema;
- ligação do componente de lookup aos hooks de lookup.

Imports compartilhados para `shared/crud` continuam permitidos porque pertencem à infraestrutura da aplicação e não ao módulo gerado.

## Marcador de sucesso

```text
FRONTEND_WIRING_OK:Produto:imports=18:resolved=12
```

O total varia conforme a quantidade de lookups e grids de detalhe inferidos.

## Integração

O contrato `wiring` faz parte da suíte agregada executada por:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

Ele é executado para os cinco fixtures e, por consequência, também integra o `validate:all` e o GitHub Actions.
