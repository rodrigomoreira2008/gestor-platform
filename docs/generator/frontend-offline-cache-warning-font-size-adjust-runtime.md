# Frontend offline cache warning font size adjust runtime

## Objetivo

Preservar as métricas tipográficas padrão no rótulo do chip de alerta offline, evitando ajustes automáticos de altura-x que possam alterar a aparência, o espaçamento ou o reflow do texto.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontSizeAdjust: 'none'
```

A propriedade é aplicada após `fontPalette: 'normal'`, mantendo paleta, eixos variáveis e métricas de fonte nos valores padrão definidos pela fonte e pelo navegador.

## Benefícios

- evita alterações automáticas de altura-x;
- preserva a aparência e o reflow previstos;
- mantém paleta, eixos variáveis e recursos OpenType normais;
- conserva renderização, dimensionamento óptico e síntese tipográfica anteriores;
- preserva dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o ajuste de tamanho desativado e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_SIZE_ADJUST_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontSizeAdjust.ts
```
