# Atalho acessível para dispensar alerta de cache antigo

A camada `frontendOfflineCacheWarningEscapeShortcutGenerator` complementa o tratamento de teclado do alerta de cache antigo.

## Comportamento gerado

O componente `Alert` declara explicitamente:

```tsx
aria-keyshortcuts="Escape"
```

Essa metainformação permite que tecnologias assistivas descubram o atalho já implementado pelo manipulador `onKeyDown`.

O comportamento funcional permanece:

- somente `Escape` dispensa o alerta;
- a dispensa do snapshot é persistida na sessão;
- o foco retorna ao chip de cache antigo;
- o alerta continua com `role="status"` e `tabIndex={-1}`.

## Contrato

O contrato `validateGeneratedFrontendOfflineCacheWarningEscapeShortcut.ts` verifica a declaração do atalho e a preservação do fluxo de dispensa e foco.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_ESCAPE_SHORTCUT_OK:<entidade>:checks=10:passed=10
```
