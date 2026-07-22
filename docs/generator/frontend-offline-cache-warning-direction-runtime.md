# Frontend offline cache warning direction runtime

## Objetivo

Declarar explicitamente a direcao de leitura do chip de alerta offline para manter ordem visual e interpretacao previsiveis em paginas com conteudo bidirecional.

## Saida gerada

O componente interativo recebe:

```tsx
dir="ltr"
```

A declaracao acompanha `lang="pt-BR"`, mantendo o aviso em portugues brasileiro com leitura da esquerda para a direita.

## Beneficios

- estabiliza a ordem do texto e dos sinais de pontuacao;
- reduz interferencia de ancestrais configurados com direcao diferente;
- preserva a pronuncia e a hifenizacao associadas ao idioma;
- mantem as relacoes ARIA do controle;
- preserva as camadas anteriores de reflow, espacamento e acessibilidade.

## Contrato

O validador dedicado verifica a direcao e a preservacao das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_DIRECTION_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningDirection.ts
```
