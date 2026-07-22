# Frontend offline cache warning bidi isolation runtime

## Objetivo

Isolar o conteúdo textual do chip de alerta offline para impedir que trechos com direção oposta alterem a ordem visual de números, pontuação ou mensagens adjacentes.

## Saída gerada

O rótulo do chip recebe:

```tsx
unicodeBidi: 'isolate'
```

A propriedade complementa `dir="ltr"` e `lang="pt-BR"`, mantendo o conteúdo em português brasileiro com direção previsível e sem interferência bidirecional externa.

## Benefícios

- contém o algoritmo bidirecional dentro do aviso;
- reduz inversões de números e pontuação em textos mistos;
- preserva a direção explícita da esquerda para a direita;
- mantém pronúncia, hifenização e quebra de texto anteriores;
- preserva as relações ARIA do controle interativo.

## Contrato

O validador dedicado verifica o isolamento e a preservação das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_BIDI_ISOLATION_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningBidiIsolation.ts
```
