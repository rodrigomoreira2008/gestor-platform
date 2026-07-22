# Dispensa de alerta por snapshot na sessão

A camada `frontendOfflineCacheWarningSessionDismissGenerator` persiste a dispensa do alerta de cache antigo em `sessionStorage`.

## Comportamento

- a chave é específica por entidade;
- o valor persistido é o `dataUpdatedAt` do snapshot dispensado;
- remounts na mesma aba mantêm o alerta oculto para o mesmo snapshot;
- um snapshot diferente remove a dispensa e rearma o alerta;
- o acesso a `window` é protegido para ambientes sem DOM.

## Chave gerada

```text
gestor:<Entidade>:offline-cache-warning-dismissed-at
```

## Contrato

O validador `validateGeneratedFrontendOfflineCacheWarningSessionDismiss.ts` verifica armazenamento, restauração, proteção SSR, limpeza por snapshot e preservação do rearme anterior.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_SESSION_DISMISS_OK:<entidade>:checks=10:passed=10
```
