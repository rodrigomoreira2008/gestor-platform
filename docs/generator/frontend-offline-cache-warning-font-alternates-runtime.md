# Frontend offline cache warning font alternates runtime

## Objetivo

Preservar as formas alternativas tipográficas padrão no rótulo do chip de alerta offline, evitando estilos alternativos impostos pela cascata sem alterar alinhamento, reflow ou dimensionamento lógico.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontVariantAlternates: 'normal'
```

A propriedade é aplicada após `fontVariantPosition: 'normal'`, mantendo posição, variantes CJK, capitalização, números, ligaduras e kerning padrão enquanto preserva os glifos normais definidos pela fonte.

## Benefícios

- evita estilos alternativos, históricos ou estilísticos acidentais;
- preserva os glifos padrão e a leitura previsível do alerta;
- mantém caracteres latinos, numéricos e CJK consistentes;
- preserva `fontVariantPosition: 'normal'` e `fontVariantEastAsian: 'normal'`;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica as alternativas tipográficas normais e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_ALTERNATES_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontAlternates.ts
```
