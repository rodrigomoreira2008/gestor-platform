# Frontend offline cache warning text hyphenation runtime

## Objetivo

Preservar a legibilidade do aviso de cache offline em textos extensos e diferentes idiomas, permitindo hifenizacao automatica sem substituir a quebra normal das palavras.

## Gerador

Arquivo:

`packages/delphi-parser/src/frontendOfflineCacheWarningTextHyphenationGenerator.ts`

A camada envolve `frontendOfflineCacheWarningTextSpacingGenerator` e acrescenta ao rotulo do `Chip`:

```tsx
hyphens: 'auto',
wordBreak: 'normal',
WebkitHyphens: 'auto'
```

## Comportamento

- permite hifenizacao dependente do idioma quando suportada pelo navegador;
- preserva a quebra linguistica normal;
- mantem `overflowWrap: 'anywhere'` como salvaguarda para tokens sem pontos naturais de quebra;
- preserva reflow, espacamento de texto, foco, area de toque e demais camadas anteriores.

A hifenizacao automatica depende do idioma definido no documento ou no elemento gerado pela aplicacao consumidora.

## Contrato

Arquivo:

`packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextHyphenation.ts`

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_HYPHENATION_OK:Produto:checks=10:passed=10
```

O contrato valida a hifenizacao, a quebra normal de palavras e a preservacao das camadas de reflow e espacamento de texto.
