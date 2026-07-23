# Frontend offline cache warning font size runtime

## Objetivo

Preservar o tamanho tipográfico herdado no rótulo do chip de alerta offline, evitando que estilos globais introduzam escalas inesperadas e alterem legibilidade, densidade visual ou reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontSize: 'inherit'
```

A propriedade é aplicada após `fontFamily: 'inherit'`, mantendo tamanho e família alinhados ao componente e ao tema ativo.

## Benefícios

- evita tamanhos tipográficos inesperados;
- preserva a escala definida pelo componente pai;
- mantém família, peso, estilo e largura tipográfica anteriores;
- conserva ajuste de tamanho, paleta e eixos variáveis já configurados;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o tamanho herdado e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_SIZE_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontSize.ts
```
