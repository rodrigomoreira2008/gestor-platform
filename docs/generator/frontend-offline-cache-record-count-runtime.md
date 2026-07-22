# Frontend offline cache record count runtime

## Objetivo

Informar quantos registros armazenados em cache continuam sendo exibidos durante uma interrupção de conexão.

## Comportamento gerado

Quando a consulta está pausada, há registros disponíveis e o cache já ultrapassou o limite de 30 minutos, o alerta informa a quantidade de registros exibidos:

```tsx
{totalRecords} registro{totalRecords === 1 ? '' : 's'} do cache estão sendo exibidos e podem estar desatualizados.
```

A mensagem também mantém o horário exato da última sincronização.

## Acessibilidade

A região `aria-live="polite"` inclui a quantidade de registros armazenados em cache e aplica flexão simples de singular e plural.

Exemplos:

- `Exibindo 1 registro armazenado em cache...`
- `Exibindo 12 registros armazenados em cache...`

## Contrato

O contrato está em:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheRecordCount.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_RECORD_COUNT_OK:<entity>:checks=10:passed=10
```

## Matriz agregada

O contrato é executado para as cinco fixtures oficiais pelo validador `validateFixtureFrontendTabbedForms.ts`.
