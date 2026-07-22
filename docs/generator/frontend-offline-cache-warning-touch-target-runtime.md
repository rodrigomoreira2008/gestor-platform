# Alvo de toque do alerta de cache offline

## Objetivo

Garantir que o chip interativo de alerta de cache offline mantenha uma area minima de toque em dispositivos com ponteiro impreciso, sem ampliar desnecessariamente o componente em ambientes desktop.

## Comportamento gerado

O gerador adiciona uma regra responsiva para dispositivos com `pointer: coarse`:

```tsx
'@media (pointer: coarse)': {
  minWidth: 44,
  minHeight: 44,
  justifyContent: 'center',
  touchAction: 'manipulation'
}
```

A regra preserva as camadas anteriores de acessibilidade:

- semantica e ativacao por teclado;
- estado indisponivel condicional;
- foco visivel;
- movimento reduzido;
- cores forcadas.

## Contrato

O validador dedicado e:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningTouchTarget.ts
```

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TOUCH_TARGET_OK:Produto:checks=10:passed=10
```

O contrato tambem participa da matriz agregada de fixtures frontend.
