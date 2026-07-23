# Frontend offline cache warning font stretch runtime

## Objetivo

Preservar a largura tipográfica normal no rótulo do chip de alerta offline, evitando que estilos globais comprimam ou expandam artificialmente os glifos e alterem a legibilidade ou o reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontStretch: 'normal'
```

A propriedade é aplicada após `fontSizeAdjust: 'none'`, mantendo métricas, largura e proporções tipográficas nos valores padrão definidos pela fonte e pelo navegador.

## Benefícios

- evita condensação ou expansão tipográfica não intencional;
- preserva proporções e largura visual dos glifos;
- mantém ajuste de tamanho desativado e paleta padrão;
- conserva eixos variáveis, recursos OpenType e renderização anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a largura tipográfica normal e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_STRETCH_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontStretch.ts
```
