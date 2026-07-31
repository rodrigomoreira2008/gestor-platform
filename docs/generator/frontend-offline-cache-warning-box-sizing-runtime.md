# Frontend offline cache warning box sizing runtime

## Objetivo

Garantir que padding e bordas do rótulo do chip de alerta offline permaneçam dentro da largura máxima declarada, evitando crescimento inesperado e overflow horizontal.

## Saída gerada

O rótulo do chip recebe:

```tsx
boxSizing: 'border-box'
```

A propriedade é aplicada após `flexShrink: 1`, preservando a capacidade de encolhimento, a quebra de texto e a ausência de truncamento.

## Benefícios

- inclui padding e bordas no cálculo da largura final;
- mantém `maxWidth: '100%'` previsível;
- reduz overflow horizontal em contêineres estreitos;
- preserva `minWidth: 0` e `flexShrink: 1`;
- mantém reflow, balanceamento e conteúdo completo.

## Contrato

O validador dedicado verifica o dimensionamento e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_BOX_SIZING_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningBoxSizing.ts
```
