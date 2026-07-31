# Frontend offline cache warning font family runtime

## Objetivo

Preservar a família tipográfica herdada no rótulo do chip de alerta offline, evitando que estilos globais introduzam famílias de fonte inesperadas e alterem identidade visual, métricas ou reflow.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontFamily: 'inherit'
```

A propriedade é aplicada após `fontWeight: 'normal'`, mantendo família, peso, estilo, largura e proporções tipográficas alinhadas ao componente e ao tema ativo.

## Benefícios

- evita famílias tipográficas inesperadas;
- preserva identidade visual e métricas herdadas;
- mantém peso, estilo e largura tipográfica normais;
- conserva ajuste de tamanho, paleta, eixos variáveis e recursos OpenType anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a família herdada e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_FAMILY_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontFamily.ts
```
