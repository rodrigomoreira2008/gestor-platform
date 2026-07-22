# Rearme do alerta de cache offline antigo

## Objetivo

Permitir que o usuário dispense temporariamente o alerta expandido de cache antigo sem impedir que o aviso reapareça em uma nova sessão offline ou após uma nova sincronização.

## Comportamento gerado

A página usa `useEffect` para observar:

- `list.fetchStatus`;
- `list.dataUpdatedAt`.

Quando a consulta deixa o estado `paused`, o estado `isOfflineCacheWarningDismissed` volta para `false`.

```tsx
useEffect(() => {
  if (list.fetchStatus !== 'paused') {
    setOfflineCacheWarningDismissed(false);
  }
}, [list.fetchStatus, list.dataUpdatedAt]);
```

Assim, o alerta dispensado permanece oculto durante a sessão offline atual, mas fica novamente disponível após reconexão ou atualização dos dados.

## Preservações

O rearme não altera:

- o `Chip` compacto de cache antigo;
- a idade relativa do cache;
- o horário da última sincronização;
- a quantidade de registros em cache;
- a região acessível `aria-live`;
- a ação manual de fechar o alerta.

## Contrato

O validador associado é:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningRearm.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_REARM_OK:<entidade>:checks=10:passed=10
```
