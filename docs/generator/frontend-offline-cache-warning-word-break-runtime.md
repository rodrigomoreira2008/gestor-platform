# Frontend offline cache warning word break runtime

## Objetivo

Preservar a quebra natural das palavras no rótulo do chip de alerta offline, priorizando pontos linguísticos adequados antes de recorrer à quebra emergencial de tokens extensos.

## Saída gerada

O rótulo do chip recebe:

```tsx
wordBreak: 'normal'
```

A propriedade é aplicada após `textAlign: 'start'`, mantendo `overflowWrap: 'anywhere'` como fallback para conteúdos que não cabem no espaço disponível.

## Benefícios

- prioriza quebras naturais entre palavras;
- evita fragmentação prematura de termos curtos;
- preserva `overflowWrap: 'anywhere'` para tokens extensos;
- mantém `hyphens: 'auto'` para idiomas compatíveis;
- preserva alinhamento lógico, balanceamento e conteúdo completo.

## Contrato

O validador dedicado verifica a quebra natural e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_WORD_BREAK_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningWordBreak.ts
```
