# Frontend offline cache age runtime

## Objetivo

Informar ao usuário há quanto tempo os registros exibidos em modo offline foram atualizados.

## Comportamento gerado

Quando a consulta está pausada e existem registros em cache, o indicador visual passa a apresentar:

```tsx
Offline · cache agora
```

ou:

```tsx
Offline · cache há 12 min
```

Quando não existe um horário de atualização disponível, o texto usa `sem horário`.

## Cálculo

A idade é calculada a partir de `list.dataUpdatedAt`:

```ts
const offlineCacheAgeMinutes =
  list.dataUpdatedAt > 0
    ? Math.max(0, Math.floor((Date.now() - list.dataUpdatedAt) / 60_000))
    : null;
```

## Acessibilidade

A região `aria-live` também inclui a idade do cache:

```text
Sem conexão. Exibindo dados armazenados em cache, atualizados há 12 min.
```

## Contrato

Validador:

```text
src/cli/validateGeneratedFrontendOfflineCacheAge.ts
```

Marcador de sucesso:

```text
FRONTEND_OFFLINE_CACHE_AGE_OK:<entidade>:checks=10:passed=10
```
