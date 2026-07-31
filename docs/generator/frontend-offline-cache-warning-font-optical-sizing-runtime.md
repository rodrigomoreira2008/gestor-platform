# Frontend offline cache warning font optical sizing runtime

## Objetivo

Preservar o dimensionamento óptico automático no rótulo do chip de alerta offline, permitindo que fontes variáveis ajustem contraste, espaçamento e desenho dos glifos conforme o tamanho renderizado.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontOpticalSizing: 'auto'
```

A propriedade é aplicada após `fontSynthesis: 'none'`, mantendo apenas formas reais da fonte e permitindo o ajuste óptico nativo quando o eixo correspondente estiver disponível.

## Benefícios

- melhora a legibilidade em tamanhos pequenos;
- preserva o ajuste óptico nativo de fontes variáveis;
- evita perda de contraste ou espaçamento inadequado;
- mantém `fontSynthesis: 'none'` e todas as variantes tipográficas anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o dimensionamento óptico automático e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_OPTICAL_SIZING_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontOpticalSizing.ts
```
