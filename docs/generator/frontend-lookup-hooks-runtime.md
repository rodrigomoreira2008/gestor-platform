# Validação dinâmica dos hooks de lookup

O executor `validateGeneratedFrontendLookupHooks.ts` valida em runtime as definições e os hooks de lookup gerados pelo parser Delphi.

## Execução individual

```bash
pnpm --filter @gestor/delphi-parser exec tsx \
  src/cli/validateGeneratedFrontendLookupHooks.ts \
  arquivo.dfm arquivo.pas Entidade TABELA
```

Use `--json` para obter um relatório estruturado.

## Contratos verificados

A validação confirma:

- existência de `lookups/<entidade>Lookups.ts`;
- existência de `lookups/<entidade>LookupHooks.ts`;
- correspondência entre definições geradas e lookups inferidos;
- export de cada hook `use<Campo>Lookup`;
- export do registro `<entidade>LookupHooks`;
- chamada de `useQuery` com `enabled` verdadeiro e falso;
- chave de cache iniciada por `lookup`;
- `staleTime` de cinco minutos;
- uma tentativa de repetição;
- propagação de `AbortSignal` ao `fetch`;
- endpoint iniciado por `/api/`;
- normalização de envelopes com `items`;
- descarte de opções sem identificador;
- preservação do objeto original em `raw`;
- ordenação alfabética pelo rótulo em português do Brasil.

## Integração com os fixtures

O contrato `lookup-hooks` faz parte da suíte agregada:

```bash
pnpm --filter @gestor/delphi-parser validate:fixture-frontend-tabbed-form
```

A suíte executa o contrato para produtos, parceiros, grupos de produtos, grupos de parceiros e pedidos. Com os contratos atualmente registrados, são realizadas 25 execuções isoladas.

## Marcador de sucesso

Uma execução válida produz um marcador semelhante a:

```text
FRONTEND_LOOKUP_HOOKS_OK:Produto:hooks=2:queries=4
```

Fixtures sem lookups inferidos também são válidos, desde que as definições e o registro de hooks sejam gerados vazios e nenhuma consulta seja iniciada.
