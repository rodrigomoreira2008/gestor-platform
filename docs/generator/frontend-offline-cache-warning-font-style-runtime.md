# Frontend offline cache warning font style runtime

## Objetivo

Preservar o estilo tipográfico normal no rótulo do chip de alerta offline, evitando que estilos globais apliquem itálico ou oblíquo e alterem a legibilidade, as métricas ou o reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontStyle: 'normal'
```

A propriedade é aplicada após `fontStretch: 'normal'`, mantendo estilo, largura e proporções tipográficas nos valores padrão definidos pela fonte e pelo navegador.

## Benefícios

- evita itálico ou oblíquo não intencional;
- preserva métricas e inclinação padrão dos glifos;
- mantém largura normal e ajuste de tamanho desativado;
- conserva paleta, eixos variáveis, recursos OpenType e renderização anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o estilo tipográfico normal e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_STYLE_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontStyle.ts
```
