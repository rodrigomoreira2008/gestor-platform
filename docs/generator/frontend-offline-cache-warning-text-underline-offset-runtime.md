# Frontend offline cache warning text underline offset runtime

## Objetivo

Manter um deslocamento de sublinhado neutro e previsível no rótulo do chip de alerta offline, caso decorações textuais sejam reativadas por temas, estilos globais ou futuras extensões visuais.

## Saída gerada

O rótulo do chip recebe:

```tsx
textUnderlineOffset: 'auto'
```

A propriedade é aplicada após `textUnderlinePosition: 'auto'`, preservando o cálculo padrão do navegador para a distância entre o texto e um eventual sublinhado.

## Benefícios

- evita deslocamentos de sublinhado herdados ou excessivos;
- mantém compatibilidade com diferentes fontes e escalas tipográficas;
- preserva posição de sublinhado, combinação vertical e orientação anteriores;
- conserva ênfase, sombra, decoração e transformação já aplicadas;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o deslocamento automático de sublinhado e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_UNDERLINE_OFFSET_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextUnderlineOffset.ts
```
