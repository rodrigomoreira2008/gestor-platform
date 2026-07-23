# Frontend offline cache warning text indent runtime

## Objetivo

Preservar o recuo tipográfico herdado no rótulo do chip de alerta offline, evitando que estilos globais introduzam deslocamentos inesperados e alterem legibilidade, alinhamento ou reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
textIndent: 'inherit'
```

A propriedade é aplicada após `wordSpacing: 'inherit'`, mantendo recuo, espaçamento entre palavras e caracteres alinhados ao componente e ao tema ativo.

## Benefícios

- evita recuos tipográficos inesperados;
- preserva o alinhamento definido pelo componente pai;
- mantém espaçamento entre palavras e caracteres, altura de linha e tamanho anteriores;
- conserva família, peso, estilo e demais configurações já aplicadas;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o recuo herdado e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_INDENT_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextIndent.ts
```
