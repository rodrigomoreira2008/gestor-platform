# Frontend offline cache warning text orientation runtime

## Objetivo

Preservar a orientação natural dos caracteres no rótulo do chip de alerta offline, inclusive quando o componente for exibido em contextos de escrita vertical.

## Saída gerada

O rótulo do chip recebe:

```tsx
textOrientation: 'mixed'
```

A propriedade é aplicada após `textEmphasis: 'none'`, mantendo caracteres latinos, números e símbolos em sua orientação natural conforme o modo de escrita ativo.

## Benefícios

- preserva a leitura natural em contextos de escrita vertical;
- evita rotação uniforme indevida de números e caracteres latinos;
- mantém ênfase, sombra, decoração e transformação textual anteriores;
- conserva recuo e espaçamentos tipográficos já aplicados;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a orientação textual mista e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_ORIENTATION_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextOrientation.ts
```
