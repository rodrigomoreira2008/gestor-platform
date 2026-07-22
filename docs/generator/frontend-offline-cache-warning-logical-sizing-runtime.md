# Frontend offline cache warning logical sizing runtime

## Objetivo

Limitar a dimensão inline do rótulo do chip de alerta offline para manter o comportamento responsivo também em diferentes modos de escrita e direções de conteúdo.

## Saída gerada

O rótulo do chip recebe:

```tsx
maxInlineSize: '100%'
```

A propriedade é aplicada após `boxSizing: 'border-box'`, complementando `maxWidth: '100%'` com uma restrição lógica independente do eixo físico.

## Benefícios

- preserva a largura máxima em diferentes modos de escrita;
- mantém padding e bordas dentro do limite calculado;
- complementa `maxWidth: '100%'` sem removê-lo;
- preserva `minWidth: 0` e `flexShrink: 1`;
- mantém direção, isolamento bidirecional e reflow anteriores.

## Contrato

O validador dedicado verifica o limite lógico e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_LOGICAL_SIZING_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningLogicalSizing.ts
```
