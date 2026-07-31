# Frontend offline cache warning text decoration line runtime

## Objetivo

Manter explicitamente desativadas as linhas de decoração textual no rótulo do chip de alerta offline, mesmo quando temas, estilos globais ou futuras extensões visuais definirem cores, estilos ou espessuras de decoração.

## Saída gerada

O rótulo do chip recebe:

```tsx
textDecorationLine: 'none'
```

A propriedade é aplicada após `textDecorationColor: 'currentColor'`, preservando os parâmetros neutros de decoração sem exibir sublinhado, sobrelinha ou texto riscado.

## Benefícios

- reforça a ausência de linhas decorativas no rótulo;
- evita sublinhados, sobrelinhas ou riscos herdados de regras globais;
- preserva cor corrente, estilo sólido, espessura automática e recorte sobre os glifos;
- conserva deslocamento e posição de sublinhado anteriores;
- mantém reflow, dimensionamento lógico e conteúdo completo.

## Contrato

O validador dedicado verifica a ausência explícita de linhas de decoração e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_DECORATION_LINE_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextDecorationLine.ts
```
