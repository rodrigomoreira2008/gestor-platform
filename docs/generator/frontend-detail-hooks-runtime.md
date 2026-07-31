# Validação dinâmica dos hooks de detalhe

O executor `validateGeneratedFrontendDetailHooks.ts` carrega o arquivo gerado em `details/<entidade>DetailHooks.ts` e valida os hooks React Query sem depender da aplicação frontend completa.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendDetailHooks.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Para obter JSON, acrescente `--json`.

## Contratos verificados

Para cada grid de detalhe inferido, o executor confirma:

- export do hook `use<Entidade><Grid>Details`;
- chamada ao `useQuery`;
- consulta desabilitada quando `masterId` não foi informado;
- consulta habilitada quando `masterId` foi informado;
- chave de cache contendo nome do grid, endpoint, campo de relacionamento e identificador mestre;
- `staleTime` de 30 segundos;
- uma tentativa adicional por meio de `retry: 1`;
- `refetchOnWindowFocus: false`;
- composição correta da URL e da query string;
- propagação do `AbortSignal` ao `fetch`;
- normalização de envelopes que retornam linhas em `items`.

Formulários sem grids inferidos também são aceitos, desde que não exportem hooks de detalhe indevidos.

## Marcador de sucesso

```text
FRONTEND_DETAIL_HOOKS_OK:Pedido:hooks=1:queries=2
```

Cada hook é executado duas vezes: uma sem identificador mestre e outra com um identificador válido.

## Suíte agregada

O contrato faz parte de:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

A suíte avançada executa, para os cinco fixtures, os contratos de formulário com abas, filtros, grids de detalhe e hooks de detalhe.
