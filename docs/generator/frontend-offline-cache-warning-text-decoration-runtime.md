# Frontend offline cache warning text decoration runtime

## Objetivo

Preservar o rótulo do chip de alerta offline sem sublinhados, riscos ou outras decorações textuais introduzidas por estilos globais ou componentes ancestrais.

## Saída gerada

O rótulo do chip recebe:

```tsx
textDecoration: 'none'
```

A propriedade é aplicada após `textTransform: 'none'`, mantendo a capitalização e a apresentação textual exatamente como foram geradas.

## Benefícios

- evita sublinhados ou riscos inesperados;
- preserva a clareza visual da mensagem;
- mantém transformação, recuo e espaçamentos tipográficos anteriores;
- conserva tamanho, família e altura de linha já aplicados;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a ausência de decoração textual e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_DECORATION_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecoration.ts
```
