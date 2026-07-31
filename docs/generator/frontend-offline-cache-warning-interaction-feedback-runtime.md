# Feedback de interação do alerta de cache offline

A camada `frontendOfflineCacheWarningInteractionFeedbackGenerator` complementa o chip do alerta com sinais visuais coerentes com seu estado interativo.

## Comportamento gerado

Quando existe cache antigo, o chip usa cursor de ponteiro, sombra no hover e uma leve redução de escala durante o pressionamento. Quando o alerta não está disponível, o cursor permanece padrão e os efeitos de hover e active não são aplicados.

```tsx
sx={{
  cursor: isOfflineCacheOld ? 'pointer' : 'default',
  transition: 'box-shadow 120ms ease, transform 120ms ease',
  '&:hover': {
    boxShadow: isOfflineCacheOld ? 1 : 0
  },
  '&:active': {
    transform: isOfflineCacheOld ? 'scale(0.98)' : 'none'
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'primary.main',
    outlineOffset: '2px'
  }
}}
```

## Contrato

O validador `validateGeneratedFrontendOfflineCacheWarningInteractionFeedback.ts` verifica os estados de cursor, hover, active, transição, foco visível e a integração com disponibilidade semântica e atalhos condicionais.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_INTERACTION_FEEDBACK_OK:<entidade>:checks=10:passed=10
```
