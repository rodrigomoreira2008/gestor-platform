# Frontend offline cache warning text decoration color runtime

## Objetivo

Manter a cor de uma eventual decoração textual sincronizada com a cor corrente do rótulo do chip de alerta offline, mesmo quando temas, estilos globais ou futuras extensões visuais reativarem sublinhados ou outras decorações.

## Saída gerada

O rótulo do chip recebe:

```tsx
textDecorationColor: 'currentColor'
```

A propriedade é aplicada após `textDecorationStyle: 'solid'`, fazendo com que uma eventual decoração acompanhe automaticamente a cor efetiva do texto.

## Benefícios

- evita cores de decoração desconectadas da cor do rótulo;
- preserva contraste e adaptação a temas claros, escuros e de alto contraste;
- mantém o estilo sólido, a espessura automática e o recorte sobre os glifos;
- conserva deslocamento e posição de sublinhado anteriores;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a cor corrente da decoração e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_DECORATION_COLOR_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecorationColor.ts
```
