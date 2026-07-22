# Alerta de cache offline: espaçamento de texto

Esta camada amplia a resiliência visual do chip de alerta offline quando o usuário aplica preferências ou extensões que aumentam espaçamento entre linhas, letras e palavras.

## Estilos gerados

```tsx
'& .MuiChip-label': {
  display: 'block',
  overflowWrap: 'anywhere',
  textAlign: 'center',
  lineHeight: 1.5,
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  paddingBlock: 4
}
```

## Objetivos

- impedir corte vertical do conteúdo em múltiplas linhas;
- preservar legibilidade com line-height ampliado;
- manter espaço interno suficiente para sobrescritas de acessibilidade;
- preservar quebra de palavras extensas e reflow;
- manter compatibilidade com área mínima de toque e margem de rolagem.

## Contrato

O contrato dedicado está em:

`packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningTextSpacing.ts`

Marcador textual esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_SPACING_OK:Produto:checks=10:passed=10
```

A presença do contrato na matriz agregada garante sua aplicação prevista às cinco fixtures oficiais.
