# Frontend offline cache warning hanging punctuation runtime

## Objetivo

Manter a largura visual do rótulo do chip de alerta offline previsível em textos iniciados ou finalizados por sinais de pontuação, evitando que caracteres sejam posicionados fora da caixa de conteúdo.

## Saída gerada

O rótulo do chip recebe:

```tsx
hangingPunctuation: 'none'
```

A propriedade é aplicada após `wordBreak: 'normal'`, preservando a quebra natural de palavras e mantendo toda a pontuação dentro dos limites calculados do elemento.

## Benefícios

- mantém sinais de pontuação dentro da caixa do rótulo;
- preserva largura e alinhamento visual previsíveis;
- evita diferenças de medição em textos com aspas e pontuação terminal;
- mantém `wordBreak: 'normal'` e `overflowWrap: 'anywhere'`;
- preserva dimensionamento lógico, balanceamento e conteúdo completo.

## Contrato

O validador dedicado verifica a pontuação não suspensa e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_HANGING_PUNCTUATION_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningHangingPunctuation.ts
```
