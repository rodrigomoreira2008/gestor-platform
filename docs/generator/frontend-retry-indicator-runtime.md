# Indicador de novas tentativas no frontend

A camada `frontendRetryIndicatorGenerator` complementa os estados de consulta do React Query com feedback visual durante novas tentativas automáticas.

## Comportamento gerado

Quando `failureCount` é maior que zero, a consulta continua em execução e não está pausada, a página exibe um `Chip` informativo com o número da tentativa atual.

```tsx
{list.failureCount > 0 && list.isFetching && list.fetchStatus !== 'paused' && (
  <Chip
    size="small"
    color="info"
    variant="outlined"
    label={`Nova tentativa ${list.failureCount}`}
    aria-label={`Nova tentativa de consulta número ${list.failureCount}`}
  />
)}
```

O indicador não substitui os estados de erro definitivo, consulta pausada ou carregamento em segundo plano.

## Contrato

O validador `validateGeneratedFrontendRetryIndicator.ts` confirma o uso de `failureCount`, a associação ao estado de busca, a exclusão do estado pausado, o texto dinâmico, a acessibilidade e a preservação dos indicadores anteriores.

Marcador esperado:

```text
FRONTEND_RETRY_INDICATOR_OK:<entidade>:checks=10:passed=10
```
