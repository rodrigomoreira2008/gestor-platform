# Recuperação de erro sensível à conexão

A camada `frontendOfflineErrorRecoveryGenerator` estende o anúncio acessível de status e adapta a ação de recuperação presente no `Alert` de erro.

## Comportamento gerado

O botão de recuperação permanece disponível quando a consulta falha, mas passa a considerar também `list.fetchStatus === 'paused'`.

```tsx
<Button
  size="small"
  disabled={list.isFetching || list.fetchStatus === 'paused'}
  onClick={() => void list.refetch()}
>
  {list.fetchStatus === 'paused'
    ? 'Sem conexão'
    : list.isFetching
      ? 'Tentando...'
      : 'Tentar novamente'}
</Button>
```

## Regras

- impede uma nova tentativa manual enquanto o transporte estiver pausado;
- informa `Sem conexão` diretamente na ação do alerta;
- mantém `Tentando...` durante o refetch;
- mantém `Tentar novamente` quando a recuperação estiver disponível;
- preserva o anúncio `aria-live`, o indicador de retentativa e os demais estados da listagem.

## Validação

O contrato `validateGeneratedFrontendOfflineErrorRecovery.ts` verifica a composição em todas as fixtures oficiais.

Marcador de sucesso:

```text
FRONTEND_OFFLINE_ERROR_RECOVERY_OK:<entity>:checks=10:passed=10
```
