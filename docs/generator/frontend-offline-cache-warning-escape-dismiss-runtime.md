# Frontend offline cache warning Escape dismiss

## Objetivo

Permitir que o alerta de cache antigo seja dispensado pelo teclado quando estiver focado, sem perder o contexto de navegação.

## Comportamento gerado

O alerta recebe um manipulador `onKeyDown`. Quando a tecla pressionada é `Escape`, a página:

1. previne o comportamento padrão;
2. marca o alerta como dispensado;
3. persiste o timestamp do snapshot no `sessionStorage`;
4. agenda o retorno de foco ao chip de cache no próximo frame.

Outras teclas não alteram o estado do aviso.

## Trecho esperado

```tsx
onKeyDown={(event) => {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  setOfflineCacheWarningDismissed(true);

  if (typeof window !== 'undefined' && list.dataUpdatedAt > 0) {
    window.sessionStorage.setItem(
      offlineCacheWarningStorageKey,
      String(list.dataUpdatedAt)
    );

    window.requestAnimationFrame(() => {
      offlineCacheWarningChipRef.current?.focus();
    });
  }
}}
```

## Contrato

Validador:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningEscapeDismiss.ts
```

Marcador de sucesso:

```text
FRONTEND_OFFLINE_CACHE_WARNING_ESCAPE_DISMISS_OK:<entidade>:checks=10:passed=10
```

## Matriz

O contrato é executado para todas as cinco fixtures oficiais na suíte `validateFixtureFrontendTabbedForms.ts`.
