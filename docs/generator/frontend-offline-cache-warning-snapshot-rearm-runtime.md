# Frontend offline cache warning snapshot rearm runtime

## Objetivo

Garantir que a dispensa do alerta de cache antigo seja válida apenas para o snapshot atual.

## Comportamento gerado

A página armazena o valor anterior de `list.dataUpdatedAt` em uma referência React:

```tsx
const previousOfflineCacheUpdatedAtRef = useRef(list.dataUpdatedAt);
```

Durante o efeito de rearme, o gerador compara o timestamp anterior com o atual:

```tsx
const cacheSnapshotChanged =
  previousOfflineCacheUpdatedAtRef.current !== list.dataUpdatedAt;
```

O alerta é rearmado quando a consulta volta ao modo online ou quando um novo snapshot é recebido, inclusive enquanto o estado permanece pausado:

```tsx
if (list.fetchStatus !== 'paused' || cacheSnapshotChanged) {
  setOfflineCacheWarningDismissed(false);
}
```

Ao final do efeito, a referência é atualizada para evitar rearmes repetidos:

```tsx
previousOfflineCacheUpdatedAtRef.current = list.dataUpdatedAt;
```

## Resultado esperado

- dispensar o alerta não afeta o indicador compacto;
- o primeiro render não é tratado como mudança de snapshot;
- um novo `dataUpdatedAt` rearma o alerta;
- reconectar também rearma o alerta;
- o mesmo snapshot não provoca reaparecimento contínuo.

## Contrato

Validador:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningSnapshotRearm.ts
```

Marcador de sucesso:

```text
FRONTEND_OFFLINE_CACHE_WARNING_SNAPSHOT_REARM_OK:<entity>:checks=10:passed=10
```
