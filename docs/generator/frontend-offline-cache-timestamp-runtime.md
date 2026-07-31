# Frontend offline cache timestamp runtime

## Objetivo

Complementar a idade relativa do cache offline com o horário exato da última sincronização dos dados exibidos.

## Comportamento gerado

A página calcula `offlineCacheUpdatedAtLabel` a partir de `list.dataUpdatedAt`:

```tsx
const offlineCacheUpdatedAtLabel =
  list.dataUpdatedAt > 0
    ? new Date(list.dataUpdatedAt).toLocaleString('pt-BR')
    : 'Horário de sincronização indisponível';
```

Quando existem registros em cache, o indicador offline recebe um `title` com o horário completo:

```tsx
title={
  totalRecords > 0
    ? `Última sincronização: ${offlineCacheUpdatedAtLabel}`
    : undefined
}
```

A região `aria-live` também inclui esse horário, permitindo que leitores de tela recebam tanto a idade relativa quanto a data e hora exatas.

## Contrato

O contrato `validateGeneratedFrontendOfflineCacheTimestamp.ts` verifica:

- uso de `list.dataUpdatedAt`;
- formatação com `toLocaleString('pt-BR')`;
- fallback quando não há timestamp;
- tooltip visual;
- anúncio acessível;
- preservação do limite de cache antigo.

Marcador de sucesso:

```text
FRONTEND_OFFLINE_CACHE_TIMESTAMP_OK:<entidade>:checks=10:passed=10
```
