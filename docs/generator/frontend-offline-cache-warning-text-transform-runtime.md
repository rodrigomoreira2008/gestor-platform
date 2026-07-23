# Frontend offline cache warning text transform runtime

## Objetivo

Preservar a capitalização original do rótulo do chip de alerta offline, evitando que estilos globais convertam automaticamente o conteúdo para maiúsculas, minúsculas ou capitalização por palavra.

## Saída gerada

O rótulo do chip recebe:

```tsx
textTransform: 'none'
```

A propriedade é aplicada após `textIndent: 'inherit'`, mantendo o conteúdo textual exatamente como foi gerado e preservando as camadas tipográficas anteriores.

## Benefícios

- evita transformação inesperada da capitalização;
- preserva nomes, números e mensagens conforme definidos pelo gerador;
- mantém recuo e espaçamentos tipográficos anteriores;
- conserva tamanho, família, peso e altura de linha já aplicados;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a ausência de transformação textual e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_TRANSFORM_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextTransform.ts
```
