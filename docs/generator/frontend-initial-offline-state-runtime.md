# Frontend initial offline state runtime

## Objetivo

A camada `frontendInitialOfflineStateGenerator` diferencia uma primeira carga sem conexão de uma listagem vazia ou de um erro definitivo.

## Comportamento gerado

Quando `list.fetchStatus === 'paused'` e ainda não existem registros carregados, a página exibe um alerta informativo:

```tsx
<Alert severity="info" role="status">
  Sem conexão. Os dados serão carregados quando a conexão for restabelecida.
</Alert>
```

O alerta de erro genérico fica oculto enquanto a consulta estiver pausada. Dados previamente carregados continuam visíveis e usam os indicadores offline já existentes.

## Composição

A camada envolve `frontendOfflineErrorRecoveryGenerator`, preservando:

- recuperação de erro sensível à conexão;
- anúncio acessível de status;
- atualização manual offline-aware;
- indicadores de retentativa, pausa, cache e carregamento em segundo plano;
- contagem de resultados e última atualização.

## Validação

O contrato `validateGeneratedFrontendInitialOfflineState.ts` verifica 10 invariantes e produz:

```text
FRONTEND_INITIAL_OFFLINE_STATE_OK:<entity>:checks=10:passed=10
```
