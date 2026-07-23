# Frontend offline cache warning word spacing runtime

## Objetivo

Preservar o espaçamento entre palavras herdado no rótulo do chip de alerta offline, evitando que estilos globais introduzam distâncias inesperadas e alterem legibilidade, densidade visual ou reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
wordSpacing: 'inherit'
```

A propriedade é aplicada após `letterSpacing: 'inherit'`, mantendo espaçamento entre palavras e caracteres alinhados ao componente e ao tema ativo.

## Benefícios

- evita espaçamento inesperado entre palavras;
- preserva a cadência de leitura definida pelo componente pai;
- mantém espaçamento entre caracteres, altura de linha, tamanho e família tipográfica anteriores;
- conserva peso, estilo, largura e demais configurações já aplicadas;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o espaçamento herdado entre palavras e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_WORD_SPACING_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningWordSpacing.ts
```
