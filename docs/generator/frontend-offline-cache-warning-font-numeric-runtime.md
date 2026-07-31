# Frontend offline cache warning font numeric runtime

## Objetivo

Preservar a apresentação numérica padrão da fonte no rótulo do chip de alerta offline, evitando variações tipográficas impostas pela cascata sem alterar alinhamento, reflow ou dimensionamento lógico.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontVariantNumeric: 'normal'
```

A propriedade é aplicada após `fontVariantLigatures: 'normal'`, mantendo as ligaduras e o kerning padrão ao mesmo tempo em que preserva a forma numérica definida pela fonte.

## Benefícios

- preserva algarismos proporcionais ou tabulares conforme a fonte;
- evita ativação acidental de variantes numéricas especiais;
- mantém combinações tipográficas visualmente consistentes;
- preserva `fontVariantLigatures: 'normal'` e `fontKerning: 'normal'`;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica as variantes numéricas normais e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_NUMERIC_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontNumeric.ts
```
