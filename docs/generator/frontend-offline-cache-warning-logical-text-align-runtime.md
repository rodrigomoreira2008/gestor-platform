# Frontend offline cache warning logical text align runtime

## Objetivo

Alinhar o texto do chip de alerta offline ao início lógico da linha, respeitando a direção do conteúdo sem fixar esquerda ou direita.

## Saída gerada

O rótulo do chip recebe:

```tsx
textAlign: 'start'
```

A propriedade é aplicada após `minInlineSize: 0`, preservando o dimensionamento lógico, a direção declarada e o isolamento bidirecional.

## Benefícios

- respeita automaticamente conteúdos `ltr` e `rtl`;
- evita alinhamento físico fixo à esquerda ou à direita;
- mantém o início visual coerente com a direção do texto;
- preserva `minInlineSize: 0` e `maxInlineSize: '100%'`;
- mantém reflow, balanceamento e quebra de tokens extensos.

## Contrato

O validador dedicado verifica o alinhamento lógico e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_LOGICAL_TEXT_ALIGN_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningLogicalTextAlign.ts
```
