# Alerta de cache offline em modo de cores forçadas

## Objetivo

Preservar a percepção visual e semântica do chip de alerta offline quando o navegador ou o sistema operacional ativa `forced-colors: active`.

## Comportamento gerado

O chip recebe uma regra específica para ambientes de alto contraste:

```tsx
'@media (forced-colors: active)': {
  border: '1px solid ButtonText',
  color: 'ButtonText',
  forcedColorAdjust: 'auto',
  '&[aria-disabled="true"]': {
    color: 'GrayText',
    borderColor: 'GrayText'
  },
  '&:focus-visible': {
    outlineColor: 'Highlight'
  }
}
```

## Garantias

- controles disponíveis usam as cores semânticas do sistema;
- o estado indisponível usa `GrayText`;
- o foco visível usa `Highlight`;
- a borda continua perceptível em temas de alto contraste;
- o suporte a movimento reduzido permanece preservado.

## Contrato

O contrato `validateGeneratedFrontendOfflineCacheWarningForcedColors.ts` verifica 10 marcadores estruturais no arquivo de página gerado.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FORCED_COLORS_OK:Produto:checks=10:passed=10
```
