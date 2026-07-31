# Atualização manual sensível à conexão

A camada `frontendOfflineRefreshGenerator` complementa os estados de consulta gerados para impedir novas solicitações manuais quando o React Query informa que a consulta está pausada.

## Comportamento

O botão de atualização continua usando `list.refetch()`, mas passa a considerar dois estados de bloqueio:

- `list.isFetching`, enquanto uma consulta está em andamento;
- `list.fetchStatus === 'paused'`, quando a consulta aguarda o retorno da conexão.

Durante o estado pausado, o texto do botão muda para `Sem conexão`. Durante uma atualização normal, permanece `Atualizando...`; fora desses estados, permanece `Atualizar`.

## Trecho gerado

```tsx
<Button
  variant="outlined"
  onClick={() => void list.refetch()}
  disabled={list.isFetching || list.fetchStatus === 'paused'}
>
  {list.fetchStatus === 'paused'
    ? 'Sem conexão'
    : list.isFetching
      ? 'Atualizando...'
      : 'Atualizar'}
</Button>
```

## Validação

O contrato `validateGeneratedFrontendOfflineRefresh.ts` verifica o bloqueio offline, os três textos possíveis e a preservação dos indicadores de retentativa, conexão pausada, progresso em segundo plano e última atualização.
