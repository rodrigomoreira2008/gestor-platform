# Foco no alerta de cache restaurado

## Objetivo

Quando o usuário reabre manualmente o alerta de cache antigo pelo chip compacto, o alerta restaurado deve receber foco programático. Isso torna a mudança perceptível para usuários de teclado e tecnologias assistivas.

## Comportamento gerado

A página mantém uma referência para o alerta:

```tsx
const offlineCacheWarningAlertRef = useRef<HTMLDivElement | null>(null);
```

O alerta recebe a referência e pode ser focado programaticamente sem entrar na ordem normal de tabulação:

```tsx
<Alert
  ref={offlineCacheWarningAlertRef}
  tabIndex={-1}
  severity="warning"
  role="status"
>
```

Ao restaurar o alerta, o foco é solicitado no próximo frame para permitir que o React conclua a nova renderização:

```tsx
setOfflineCacheWarningDismissed(false);
window.requestAnimationFrame(() => {
  offlineCacheWarningAlertRef.current?.focus();
});
```

## Contrato

Validador:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningRestoreFocus.ts
```

Marcador de sucesso esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_RESTORE_FOCUS_OK:<entidade>:checks=10:passed=10
```

## Matriz

O contrato `offline-cache-warning-restore-focus` é executado para as cinco fixtures oficiais. A matriz agregada passa a conter 57 contratos e 285 combinações.
