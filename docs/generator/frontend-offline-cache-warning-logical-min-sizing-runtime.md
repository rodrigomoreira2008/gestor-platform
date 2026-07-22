# Frontend offline cache warning logical min sizing runtime

## Objetivo

Permitir que o rótulo do chip de alerta offline encolha corretamente no eixo inline em diferentes modos de escrita, evitando que a largura mínima intrínseca force overflow horizontal.

## Saída gerada

O rótulo do chip recebe:

```tsx
minInlineSize: 0
```

A propriedade é aplicada após `maxInlineSize: '100%'`, complementando `minWidth: 0` com uma restrição lógica independente do eixo físico.

## Benefícios

- permite encolhimento no eixo inline em diferentes modos de escrita;
- complementa `minWidth: 0` sem removê-lo;
- preserva `maxInlineSize: '100%'` e `maxWidth: '100%'`;
- mantém `flexShrink: 1` e `boxSizing: 'border-box'`;
- preserva reflow, conteúdo completo e quebra de tokens extensos.

## Contrato

O validador dedicado verifica a largura mínima lógica e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_LOGICAL_MIN_SIZING_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningLogicalMinSizing.ts
```
