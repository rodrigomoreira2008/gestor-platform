# Frontend offline cache warning text decoration skip ink runtime

## Objetivo

Manter o comportamento automático de recorte de decoração sobre os glifos no rótulo do chip de alerta offline, caso sublinhados ou outras decorações sejam reativados por temas, estilos globais ou futuras extensões visuais.

## Saída gerada

O rótulo do chip recebe:

```tsx
textDecorationSkipInk: 'auto'
```

A propriedade é aplicada após `textUnderlineOffset: 'auto'`, permitindo que o navegador ajuste automaticamente a passagem de uma eventual decoração ao redor de hastes e descendentes dos caracteres.

## Benefícios

- evita que sublinhados atravessem partes importantes dos glifos;
- mantém compatibilidade com diferentes fontes e escalas tipográficas;
- preserva deslocamento e posição de sublinhado anteriores;
- conserva combinação vertical, orientação, ênfase e sombra já aplicadas;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o recorte automático da decoração e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_DECORATION_SKIP_INK_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecorationSkipInk.ts
```
