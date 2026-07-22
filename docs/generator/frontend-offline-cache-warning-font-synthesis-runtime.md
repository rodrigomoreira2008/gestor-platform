# Frontend offline cache warning font synthesis runtime

## Objetivo

Impedir a síntese tipográfica artificial no rótulo do chip de alerta offline, evitando negrito, itálico ou pequenas capitais simulados pelo navegador quando a fonte não oferece esses glifos.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontSynthesis: 'none'
```

A propriedade é aplicada após `fontVariantAlternates: 'normal'`, preservando as formas tipográficas reais da fonte e todas as camadas anteriores.

## Benefícios

- evita negrito e itálico artificiais;
- impede pequenas capitais sintetizadas;
- preserva métricas, linha de base e legibilidade;
- mantém as variantes tipográficas anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a síntese tipográfica desativada e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_SYNTHESIS_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontSynthesis.ts
```
