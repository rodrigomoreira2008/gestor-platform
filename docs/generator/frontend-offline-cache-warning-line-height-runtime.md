# Frontend offline cache warning line height runtime

## Objetivo

Preservar a altura de linha herdada no rótulo do chip de alerta offline, evitando que estilos globais introduzam espaçamentos verticais inesperados e alterem legibilidade, densidade visual ou reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
lineHeight: 'inherit'
```

A propriedade é aplicada após `fontSize: 'inherit'`, mantendo altura de linha e tamanho alinhados ao componente e ao tema ativo.

## Benefícios

- evita alturas de linha inesperadas;
- preserva o ritmo vertical definido pelo componente pai;
- mantém tamanho, família, peso, estilo e largura tipográfica anteriores;
- conserva ajuste de tamanho, paleta e demais configurações já aplicadas;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a altura de linha herdada e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_LINE_HEIGHT_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningLineHeight.ts
```
