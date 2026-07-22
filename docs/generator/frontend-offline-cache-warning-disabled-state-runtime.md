# Estado desabilitado do alerta de cache offline

## Objetivo

Evitar que o chip de cache offline permaneça focável ou acionável quando não existe alerta de dados antigos.

## Comportamento gerado

Quando `isOfflineCacheOld` é falso, o controle recebe:

```tsx
aria-disabled={!isOfflineCacheOld}
tabIndex={isOfflineCacheOld ? 0 : -1}
```

O manipulador de teclado também encerra imediatamente:

```tsx
if (!isOfflineCacheOld) return;
```

Quando o cache está antigo, o chip continua disponível por clique, Enter e Espaço.

## Benefícios

- Remove controles inativos da ordem de foco.
- Expõe o estado indisponível para tecnologias assistivas.
- Impede ativação por teclado fora do estado aplicável.
- Mantém alinhamento entre estado visual, foco e comportamento.

## Contrato

O contrato `validateGeneratedFrontendOfflineCacheWarningDisabledState.ts` verifica 10 marcadores estruturais no frontend gerado.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_DISABLED_STATE_OK:<entity>:checks=10:passed=10
```
