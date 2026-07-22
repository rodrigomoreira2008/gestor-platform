# Descrição acessível do estado do alerta de cache

O gerador `frontendOfflineCacheWarningStateDescriptionGenerator` complementa o chip de sincronização com uma descrição textual explícita do estado atual do alerta.

## Comportamento gerado

O chip recebe `aria-description` dinâmico:

```tsx
aria-description={
  isOfflineCacheOld
    ? isOfflineCacheWarningDismissed
      ? 'O alerta de dados desatualizados está oculto.'
      : 'O alerta de dados desatualizados está visível.'
    : 'Os dados estão atualizados.'
}
```

A descrição complementa o rótulo de ação, diferenciando a ação disponível do estado atual.

## Estados

- Cache antigo e alerta visível: informa que o alerta está visível.
- Cache antigo e alerta dispensado: informa que o alerta está oculto.
- Cache válido: informa que os dados estão atualizados.

## Contrato

O contrato `validateGeneratedFrontendOfflineCacheWarningStateDescription.ts` verifica 10 marcadores estruturais e de acessibilidade.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_STATE_DESCRIPTION_OK:<entity>:checks=10:passed=10
```

O contrato também integra a matriz `validateFixtureFrontendTabbedForms.ts` para todas as fixtures oficiais.
