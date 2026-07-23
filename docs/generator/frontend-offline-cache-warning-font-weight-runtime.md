# Frontend offline cache warning font weight runtime

## Objetivo

Preservar o peso tipográfico normal no rótulo do chip de alerta offline, evitando que estilos globais apliquem negrito, pesos leves ou eixos de peso customizados e alterem a legibilidade, as métricas ou o reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontWeight: 'normal'
```

A propriedade é aplicada após `fontStyle: 'normal'`, mantendo peso, estilo, largura e proporções tipográficas nos valores padrão definidos pela fonte e pelo navegador.

## Benefícios

- evita negrito ou pesos customizados não intencionais;
- preserva espessura e métricas padrão dos glifos;
- mantém estilo e largura tipográfica normais;
- conserva ajuste de tamanho, paleta, eixos variáveis e recursos OpenType anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o peso tipográfico normal e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_WEIGHT_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontWeight.ts
```
