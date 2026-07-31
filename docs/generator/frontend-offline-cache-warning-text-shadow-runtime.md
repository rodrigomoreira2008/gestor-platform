# Frontend offline cache warning text shadow runtime

## Objetivo

Preservar o rótulo do chip de alerta offline sem sombras textuais introduzidas por estilos globais ou componentes ancestrais, mantendo contraste e legibilidade consistentes.

## Saída gerada

O rótulo do chip recebe:

```tsx
textShadow: 'none'
```

A propriedade é aplicada após `textDecoration: 'none'`, mantendo o conteúdo sem sombras, sublinhados ou riscos inesperados.

## Benefícios

- evita sombras textuais que reduzam contraste;
- preserva a nitidez da mensagem em temas claros e escuros;
- mantém decoração, transformação, recuo e espaçamentos tipográficos anteriores;
- conserva tamanho e altura de linha já aplicados;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a ausência de sombra textual e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_SHADOW_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextShadow.ts
```
