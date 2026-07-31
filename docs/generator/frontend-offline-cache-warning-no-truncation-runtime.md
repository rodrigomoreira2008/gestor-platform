# Frontend offline cache warning no truncation runtime

## Objetivo

Preservar todo o conteúdo textual do chip de alerta offline, evitando reticências ou recortes que escondam informações importantes em larguras reduzidas.

## Saída gerada

O rótulo do chip recebe:

```tsx
textOverflow: 'clip',
overflow: 'visible'
```

As propriedades são aplicadas após `textWrap: 'balance'`, preservando reflow, hifenização, isolamento bidirecional e balanceamento de linhas.

## Benefícios

- impede a substituição silenciosa de conteúdo por reticências;
- mantém o texto completo disponível visualmente;
- preserva `whiteSpace: 'normal'` e `overflowWrap: 'anywhere'`;
- mantém altura automática e largura máxima responsiva;
- preserva hifenização, idioma e direção anteriores.

## Contrato

O validador dedicado verifica a ausência de truncamento e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_NO_TRUNCATION_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningNoTruncation.ts
```
