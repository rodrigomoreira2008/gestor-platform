# Frontend offline cache warning font position runtime

## Objetivo

Preservar a posição tipográfica normal no rótulo do chip de alerta offline, evitando sobrescrito ou subscrito imposto pela cascata sem alterar alinhamento, reflow ou dimensionamento lógico.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontVariantPosition: 'normal'
```

A propriedade é aplicada após `fontVariantEastAsian: 'normal'`, mantendo variantes CJK, capitalização, números, ligaduras e kerning padrão ao mesmo tempo em que preserva a linha de base original do conteúdo.

## Benefícios

- evita sobrescrito ou subscrito acidental;
- preserva a linha de base e a altura visual do chip;
- mantém caracteres latinos, numéricos e CJK consistentes;
- preserva `fontVariantEastAsian: 'normal'` e `fontVariantCaps: 'normal'`;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a posição tipográfica normal e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_POSITION_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontPosition.ts
```
