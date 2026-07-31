# Frontend offline cache warning text decoration thickness runtime

## Objetivo

Manter uma espessura de decoração textual neutra e previsível no rótulo do chip de alerta offline, caso sublinhados ou outras decorações sejam reativados por temas, estilos globais ou futuras extensões visuais.

## Saída gerada

O rótulo do chip recebe:

```tsx
textDecorationThickness: 'auto'
```

A propriedade é aplicada após `textDecorationSkipInk: 'auto'`, permitindo que o navegador determine automaticamente uma espessura compatível com a fonte e com a escala tipográfica ativa.

## Benefícios

- evita espessuras excessivas ou incompatíveis herdadas de estilos globais;
- mantém compatibilidade com diferentes fontes, pesos e escalas tipográficas;
- preserva o recorte automático da decoração sobre os glifos;
- conserva deslocamento, posição de sublinhado, orientação e ênfase anteriores;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a espessura automática da decoração e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_DECORATION_THICKNESS_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecorationThickness.ts
```
