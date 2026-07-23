# Frontend offline cache warning text decoration style runtime

## Objetivo

Manter um estilo de decoração textual neutro e previsível no rótulo do chip de alerta offline, caso sublinhados ou outras decorações sejam reativados por temas, estilos globais ou futuras extensões visuais.

## Saída gerada

O rótulo do chip recebe:

```tsx
textDecorationStyle: 'solid'
```

A propriedade é aplicada após `textDecorationThickness: 'auto'`, garantindo que uma eventual decoração use o estilo sólido padrão, com espessura calculada automaticamente pelo navegador.

## Benefícios

- evita estilos ondulados, tracejados ou pontilhados herdados de regras globais;
- mantém uma aparência previsível em diferentes fontes e escalas tipográficas;
- preserva a espessura automática e o recorte da decoração sobre os glifos;
- conserva deslocamento, posição de sublinhado, orientação e ênfase anteriores;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o estilo sólido da decoração e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_DECORATION_STYLE_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecorationStyle.ts
```
