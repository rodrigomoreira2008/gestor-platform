# Frontend offline cached data runtime

## Objetivo

Diferenciar a ausência total de dados durante uma primeira consulta offline do cenário em que a aplicação perde a conexão, mas ainda possui registros previamente carregados em cache.

## Composição

A camada `frontendOfflineCachedDataGenerator` envolve `frontendInitialOfflineStateGenerator` e altera somente a página gerada da entidade.

## Comportamento

Quando `list.fetchStatus === 'paused'` e existem registros (`totalRecords > 0`), o chip de conexão passa a mostrar:

```tsx
Offline · exibindo cache
```

O rótulo acessível correspondente informa:

```text
Sem conexão. Exibindo dados armazenados em cache
```

Quando não existem registros, permanece o estado inicial:

```tsx
Sem conexão
```

com o alerta explicando que os dados serão carregados assim que a conexão for restabelecida.

## Anúncio acessível

A região `aria-live` também diferencia o cenário com cache:

```text
Sem conexão. Exibindo dados armazenados em cache.
```

## Contrato

O validador `validateGeneratedFrontendOfflineCachedData.ts` verifica a condição com registros, os textos visuais e acessíveis, a preservação do estado inicial offline e a integração com os demais estados de consulta.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHED_DATA_OK:<entity>:checks=10:passed=10
```
