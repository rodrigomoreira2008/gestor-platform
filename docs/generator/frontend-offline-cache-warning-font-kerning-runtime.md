# Frontend offline cache warning font kerning runtime

## Objetivo

Preservar o espaçamento tipográfico natural entre pares de caracteres no rótulo do chip de alerta offline, melhorando a legibilidade sem alterar o comportamento de reflow e dimensionamento lógico.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontKerning: 'normal'
```

A propriedade é aplicada após `hangingPunctuation: 'none'`, mantendo a pontuação dentro da caixa e permitindo que o navegador utilize o kerning definido pela fonte.

## Benefícios

- preserva o ajuste natural entre pares de caracteres;
- melhora a leitura de combinações tipográficas específicas;
- evita desativação acidental do kerning pela cascata;
- mantém `wordBreak: 'normal'` e `overflowWrap: 'anywhere'`;
- preserva dimensionamento lógico, balanceamento e conteúdo completo.

## Contrato

O validador dedicado verifica o kerning normal e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_KERNING_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontKerning.ts
```
