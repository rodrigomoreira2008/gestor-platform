# Frontend offline cache warning font caps runtime

## Objetivo

Preservar a capitalização tipográfica normal no rótulo do chip de alerta offline, evitando small caps ou outras variantes de caixa impostas pela cascata sem alterar alinhamento, reflow ou dimensionamento lógico.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontVariantCaps: 'normal'
```

A propriedade é aplicada após `fontVariantNumeric: 'normal'`, mantendo as variantes numéricas, as ligaduras e o kerning padrão ao mesmo tempo em que preserva a caixa original do conteúdo.

## Benefícios

- preserva letras maiúsculas e minúsculas conforme o texto original;
- evita ativação acidental de small caps e petite caps;
- mantém combinações tipográficas visualmente consistentes;
- preserva `fontVariantNumeric: 'normal'` e `fontVariantLigatures: 'normal'`;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica as variantes de caixa normais e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_CAPS_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontCaps.ts
```
