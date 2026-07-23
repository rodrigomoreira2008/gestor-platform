# Frontend offline cache warning text emphasis runtime

## Objetivo

Preservar o rótulo do chip de alerta offline sem marcas de ênfase tipográfica introduzidas por estilos globais ou componentes ancestrais, mantendo a mensagem visualmente limpa e legível.

## Saída gerada

O rótulo do chip recebe:

```tsx
textEmphasis: 'none'
```

A propriedade é aplicada após `textShadow: 'none'`, mantendo o conteúdo sem marcas de ênfase, sombras, sublinhados ou riscos inesperados.

## Benefícios

- evita pontos, círculos ou outras marcas de ênfase herdadas;
- preserva a clareza visual da mensagem;
- mantém sombra, decoração, transformação e recuo anteriores;
- conserva espaçamentos e altura de linha já aplicados;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a ausência de ênfase textual e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_EMPHASIS_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextEmphasis.ts
```
