# Frontend offline cache warning font variation settings runtime

## Objetivo

Preservar os eixos padrão de fontes variáveis no rótulo do chip de alerta offline, evitando que estilos globais imponham peso, largura, inclinação ou outros eixos tipográficos customizados.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontVariationSettings: 'normal'
```

A propriedade é aplicada após `fontFeatureSettings: 'normal'`, mantendo os recursos OpenType e os eixos variáveis sob os valores padrão definidos pela fonte e pelo navegador.

## Benefícios

- evita eixos variáveis customizados não intencionais;
- preserva peso, largura e inclinação padrão da fonte;
- mantém configurações OpenType normais;
- conserva renderização, dimensionamento óptico e síntese tipográfica anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica os eixos variáveis padrão e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_VARIATION_SETTINGS_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontVariationSettings.ts
```
