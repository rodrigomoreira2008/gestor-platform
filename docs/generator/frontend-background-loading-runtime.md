# Indicador de carregamento em segundo plano

O frontend gerado exibe uma barra de progresso enquanto uma listagem já carregada está sendo atualizada novamente.

## Comportamento

- Usa `list.isFetching` do React Query.
- Não substitui o estado de carregamento inicial, pois exige `!list.isLoading`.
- Mantém os registros existentes visíveis durante o refetch.
- Usa `LinearProgress` do Material UI.
- Inclui o rótulo acessível `Atualizando listagem`.
- Funciona com atualização manual, recuperação de erro e invalidações da consulta.

## Contrato

O validador está em:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendBackgroundLoading.ts
```

Quando todas as verificações passam, ele imprime:

```text
FRONTEND_BACKGROUND_LOADING_OK:<entidade>:checks=9:passed=9
```

O contrato também integra a matriz de fixtures em `validateFixtureFrontendTabbedForms.ts`.
