# Frontend offline cache warning live state

A camada `frontendOfflineCacheWarningLiveStateGenerator` complementa o chip de sincronização com uma região de anúncio educada.

## Comportamento gerado

O chip recebe:

```tsx
aria-live="polite"
aria-atomic="true"
```

Como o rótulo acessível do chip muda entre mostrar, ocultar e informar a última sincronização, tecnologias assistivas podem anunciar a mudança sem interromper mensagens mais urgentes.

A atualização atômica garante que o rótulo completo seja considerado em cada alteração.

## Preservações

A camada preserva:

- `aria-pressed`;
- `aria-expanded`;
- `aria-controls`;
- rótulo dinâmico;
- atalho Escape;
- descrição acessível do atalho;
- restauração e dispensa do alerta.

## Contrato

O validador associado é:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningLiveState.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_LIVE_STATE_OK:<entidade>:checks=10:passed=10
```
