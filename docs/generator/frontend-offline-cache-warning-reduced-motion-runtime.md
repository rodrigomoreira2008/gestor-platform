# Frontend offline cache warning reduced motion runtime

Esta camada estende o gerador de feedback de interacao do aviso de cache offline para respeitar a preferencia de movimento reduzido do sistema operacional.

## Gerador

Arquivo:

`packages/delphi-parser/src/frontendOfflineCacheWarningReducedMotionGenerator.ts`

O gerador preserva cursor, hover, estado pressionado e foco visivel, adicionando uma media query especifica:

```tsx
'@media (prefers-reduced-motion: reduce)': {
  transition: 'none',
  '&:active': {
    transform: 'none'
  }
}
```

Quando `prefers-reduced-motion: reduce` estiver ativo, o chip deixa de animar sombra e escala. O destaque de foco e os estados semanticos continuam disponiveis.

## Contrato

Arquivo:

`packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningReducedMotion.ts`

O contrato verifica a media query, a remocao de transicao e transformacao, a preservacao do comportamento padrao e os estados acessiveis do controle.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_REDUCED_MOTION_OK:<entidade>:checks=10:passed=10
```

## Matriz agregada

O contrato `offline-cache-warning-reduced-motion` participa da matriz executada por `validateFixtureFrontendTabbedForms.ts` para todas as fixtures oficiais.
