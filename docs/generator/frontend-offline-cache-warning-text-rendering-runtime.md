# Frontend offline cache warning text rendering runtime

## Objetivo

Preservar a legibilidade tipográfica do rótulo do chip de alerta offline, solicitando ao navegador otimizações de kerning e ligaduras quando disponíveis sem alterar o conteúdo, o reflow ou o dimensionamento lógico.

## Saída gerada

O rótulo do chip recebe:

```tsx
textRendering: 'optimizeLegibility'
```

A propriedade é aplicada após `fontOpticalSizing: 'auto'`, mantendo o ajuste óptico nativo e priorizando a legibilidade do texto renderizado.

## Benefícios

- favorece kerning e ligaduras voltados à leitura;
- preserva o dimensionamento óptico automático;
- mantém síntese tipográfica desativada;
- conserva as variantes tipográficas anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a renderização otimizada e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_RENDERING_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextRendering.ts
```
