# Frontend offline cache warning flex reflow runtime

## Objetivo

Permitir que o rótulo do chip de alerta offline encolha e quebre corretamente dentro de layouts flexíveis, evitando overflow horizontal em larguras reduzidas.

## Saída gerada

O rótulo do chip recebe:

```tsx
minWidth: 0,
flexShrink: 1
```

As propriedades são aplicadas após as regras de conteúdo completo, preservando reflow, balanceamento, hifenização e ausência de truncamento.

## Benefícios

- permite que o item flexível fique menor que sua largura intrínseca;
- evita que textos longos forcem overflow horizontal;
- preserva `whiteSpace: 'normal'` e `overflowWrap: 'anywhere'`;
- mantém o conteúdo completo sem reticências;
- preserva altura automática e largura máxima responsiva.

## Contrato

O validador dedicado verifica o reflow flexível e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FLEX_REFLOW_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFlexReflow.ts
```
