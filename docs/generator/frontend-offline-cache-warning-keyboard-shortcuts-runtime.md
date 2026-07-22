# Atalhos de teclado do alerta de cache offline

O gerador `frontendOfflineCacheWarningKeyboardShortcutsGenerator` complementa a ativação por teclado do chip que controla o alerta de dados desatualizados.

## Comportamento gerado

O chip recebe a declaração acessível:

```tsx
aria-keyshortcuts="Enter Space"
```

A propriedade acompanha a implementação existente:

```tsx
role="button"
tabIndex={0}
onKeyDown={(event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  event.currentTarget.click();
}}
```

Assim, tecnologias assistivas podem informar que `Enter` e `Espaço` executam a ação de mostrar ou ocultar o alerta.

## Contrato

O contrato `validateGeneratedFrontendOfflineCacheWarningKeyboardShortcuts.ts` verifica a declaração dos atalhos, a semântica de botão, a navegabilidade por foco, a ativação por teclado e a preservação dos estados ARIA relacionados ao alerta.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_KEYBOARD_SHORTCUTS_OK:<entity>:checks=10:passed=10
```
