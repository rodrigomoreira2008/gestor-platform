# Frontend offline cache warning font ligatures runtime

## Objetivo

Preservar as ligaduras tipográficas padrão da fonte no rótulo do chip de alerta offline, mantendo a aparência natural de combinações de caracteres sem alterar o reflow ou o dimensionamento lógico.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontVariantLigatures: 'normal'
```

A propriedade é aplicada após `fontKerning: 'normal'`, permitindo que o navegador utilize as ligaduras padrão definidas pela fonte em conjunto com o kerning normal.

## Benefícios

- preserva ligaduras comuns e contextuais suportadas pela fonte;
- mantém combinações tipográficas visualmente naturais;
- evita desativação acidental das ligaduras pela cascata;
- preserva `fontKerning: 'normal'` e `hangingPunctuation: 'none'`;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica as ligaduras normais e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_LIGATURES_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontLigatures.ts
```
