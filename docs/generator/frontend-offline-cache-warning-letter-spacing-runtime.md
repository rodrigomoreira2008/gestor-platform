# Frontend offline cache warning letter spacing runtime

## Objetivo

Preservar o espaçamento entre caracteres herdado no rótulo do chip de alerta offline, evitando que estilos globais introduzam tracking inesperado e alterem legibilidade, densidade visual ou reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
letterSpacing: 'inherit'
```

A propriedade é aplicada após `lineHeight: 'inherit'`, mantendo espaçamento entre caracteres, altura de linha e tamanho alinhados ao componente e ao tema ativo.

## Benefícios

- evita tracking inesperado;
- preserva o espaçamento definido pelo componente pai;
- mantém altura de linha, tamanho, família, peso, estilo e largura tipográfica anteriores;
- conserva ajuste de tamanho, paleta e demais configurações já aplicadas;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o espaçamento herdado e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_LETTER_SPACING_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningLetterSpacing.ts
```
