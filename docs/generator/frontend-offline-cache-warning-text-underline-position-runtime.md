# Frontend offline cache warning text underline position runtime

## Objetivo

Manter uma posição de sublinhado neutra e previsível no rótulo do chip de alerta offline, caso decorações textuais sejam reativadas por temas, estilos globais ou futuras extensões visuais.

## Saída gerada

O rótulo do chip recebe:

```tsx
textUnderlinePosition: 'auto'
```

A propriedade é aplicada após `textCombineUpright: 'none'`, preservando o comportamento padrão do navegador para posicionamento de sublinhados sem alterar a orientação ou a combinação vertical dos caracteres.

## Benefícios

- evita posicionamentos forçados de sublinhado herdados;
- mantém compatibilidade com diferentes fontes e modos de escrita;
- preserva combinação vertical, orientação, ênfase e sombra anteriores;
- conserva decoração, transformação e recuo já aplicados;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica o posicionamento automático de sublinhado e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_UNDERLINE_POSITION_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextUnderlinePosition.ts
```
