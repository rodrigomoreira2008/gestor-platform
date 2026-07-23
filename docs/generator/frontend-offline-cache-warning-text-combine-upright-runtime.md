# Frontend offline cache warning text combine upright runtime

## Objetivo

Preservar números, símbolos e sequências curtas do rótulo do chip de alerta offline sem compactação vertical automática, mantendo a leitura previsível em diferentes modos de escrita.

## Saída gerada

O rótulo do chip recebe:

```tsx
textCombineUpright: 'none'
```

A propriedade é aplicada após `textOrientation: 'mixed'`, preservando a orientação natural dos caracteres sem combiná-los em um único bloco vertical.

## Benefícios

- evita compactação inesperada de números e símbolos;
- mantém sequências de texto visualmente consistentes;
- preserva orientação, ênfase, sombra e decoração anteriores;
- conserva recuo e espaçamentos tipográficos já aplicados;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a ausência de combinação vertical e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_COMBINE_UPRIGHT_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextCombineUpright.ts
```
