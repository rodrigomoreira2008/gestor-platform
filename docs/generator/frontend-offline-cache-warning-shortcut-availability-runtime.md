# Disponibilidade dos atalhos do alerta de cache offline

## Objetivo

Garantir que os atalhos de teclado do chip de cache offline sejam anunciados apenas quando o controle estiver disponível para interação.

## Contrato gerado

O chip passa a usar:

```tsx
aria-keyshortcuts={isOfflineCacheOld ? 'Enter Space' : undefined}
aria-disabled={!isOfflineCacheOld}
tabIndex={isOfflineCacheOld ? 0 : -1}
```

O manipulador de teclado continua bloqueando a interação quando não existe cache antigo:

```tsx
if (!isOfflineCacheOld) return;
```

## Comportamento esperado

- Cache antigo: `Enter` e `Espaço` são anunciados e acionam o chip.
- Dados atualizados: nenhum atalho é anunciado.
- Dados atualizados: o chip fica fora da ordem de foco.
- Dados atualizados: eventos de teclado são ignorados.

## Validação

O contrato está em:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningShortcutAvailability.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_SHORTCUT_AVAILABILITY_OK:<entidade>:checks=10:passed=10
```
