# Frontend offline cache warning font East Asian runtime

## Objetivo

Preservar as variantes tipográficas padrão para caracteres do leste asiático no rótulo do chip de alerta offline, evitando formas alternativas impostas pela cascata sem alterar alinhamento, reflow ou dimensionamento lógico.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontVariantEastAsian: 'normal'
```

A propriedade é aplicada após `fontVariantCaps: 'normal'`, mantendo capitalização, variantes numéricas, ligaduras e kerning padrão enquanto preserva a forma tipográfica original de caracteres CJK.

## Benefícios

- preserva as formas padrão definidas pela fonte;
- evita ativação acidental de variantes ruby, jis ou simplificadas;
- mantém caracteres latinos e CJK visualmente consistentes;
- preserva `fontVariantCaps: 'normal'` e `fontVariantNumeric: 'normal'`;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica as variantes do leste asiático normais e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_EAST_ASIAN_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontEastAsian.ts
```
