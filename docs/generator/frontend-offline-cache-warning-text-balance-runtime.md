# Frontend offline cache warning text balance runtime

## Objetivo

Balancear as linhas do chip de alerta offline para melhorar a legibilidade de mensagens extensas sem remover reflow, hifenização ou isolamento bidirecional.

## Saída gerada

O rótulo do chip recebe:

```tsx
textWrap: 'balance'
```

A propriedade é aplicada após `unicodeBidi: 'isolate'`, preservando as camadas anteriores de direção, idioma e quebra de texto.

## Benefícios

- reduz linhas finais excessivamente curtas;
- melhora a distribuição visual de mensagens em múltiplas linhas;
- preserva `whiteSpace: 'normal'` e `overflowWrap: 'anywhere'`;
- mantém hifenização automática e isolamento bidirecional;
- preserva largura máxima e altura automática do chip.

## Contrato

O validador dedicado verifica o balanceamento e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_BALANCE_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextBalance.ts
```
