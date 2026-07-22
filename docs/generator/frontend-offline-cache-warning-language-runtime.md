# Frontend offline cache warning language runtime

## Objetivo

Declarar explicitamente o idioma do chip de alerta offline para que leitores de tela, mecanismos de hifenizacao e outras tecnologias assistivas usem regras linguisticas adequadas.

## Saida gerada

O componente interativo recebe:

```tsx
lang="pt-BR"
```

A declaracao e aplicada diretamente ao chip que apresenta o estado do cache offline.

## Beneficios

- melhora a pronuncia do aviso por leitores de tela;
- permite que `hyphens: 'auto'` use regras do portugues brasileiro;
- preserva a quebra linguistica normal;
- evita depender exclusivamente do idioma herdado da pagina;
- mantem as camadas anteriores de reflow, espacamento e acessibilidade.

## Contrato

O validador dedicado verifica o idioma e a preservacao das camadas anteriores:

```text
FRONTEND_OFFLINE_CACHE_WARNING_LANGUAGE_OK:Produto:checks=10:passed=10
```

Arquivo do contrato:

```text
packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningLanguage.ts
```
