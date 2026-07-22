# Frontend offline cache warning font feature settings runtime

## Objetivo

Preservar a configuração OpenType padrão no rótulo do chip de alerta offline, evitando ativação acidental de recursos tipográficos personalizados pela cascata ou por estilos globais.

## Saída gerada

O rótulo do chip recebe:

```tsx
fontFeatureSettings: 'normal'
```

A propriedade é aplicada após `textRendering: 'optimizeLegibility'`, mantendo a renderização voltada à leitura sem impor recursos OpenType específicos.

## Benefícios

- evita ligaduras, alternativas e conjuntos estilísticos personalizados não intencionais;
- preserva o comportamento padrão definido pela fonte e pelo navegador;
- mantém o dimensionamento óptico automático e a síntese tipográfica desativada;
- conserva as variantes tipográficas anteriores;
- preserva reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a configuração OpenType padrão e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FONT_FEATURE_SETTINGS_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningFontFeatureSettings.ts
```
