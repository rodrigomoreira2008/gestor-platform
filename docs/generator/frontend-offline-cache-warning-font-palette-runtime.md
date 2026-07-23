# Frontend offline cache warning font palette runtime

## Objetivo

Preservar a paleta padrão de fontes coloridas no rótulo do chip de alerta offline, evitando que estilos globais imponham paletas alternativas ou customizadas.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontPalette: 'normal'
```

A propriedade é aplicada após `fontVariationSettings: 'normal'`, mantendo eixos variáveis e paletas de cor nos valores padrão definidos pela fonte e pelo navegador.

## Benefícios

- evita paletas coloridas customizadas não intencionais;
- preserva o comportamento padrão de fontes COLR e similares;
- mantém eixos variáveis e recursos OpenType normais;
- conserva renderização, dimensionamento óptico e síntese tipográfica anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a paleta padrão e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_PALETTE_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontPalette.ts
```
