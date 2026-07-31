# Frontend offline cache warning text reflow

Esta camada amplia a robustez visual do chip de aviso de cache offline em telas estreitas, zoom elevado e textos localizados mais longos.

## Comportamento gerado

O estilo do chip inclui:

```tsx
maxWidth: '100%',
height: 'auto',
whiteSpace: 'normal',
'& .MuiChip-label': {
  display: 'block',
  overflowWrap: 'anywhere',
  textAlign: 'center'
}
```

## Garantias

- O aviso não fica limitado a uma única linha.
- Palavras ou identificadores longos podem quebrar sem causar rolagem horizontal.
- A altura cresce conforme o conteúdo.
- O chip respeita a largura disponível do contêiner.
- O conteúdo permanece centralizado.
- As camadas anteriores de foco, área de toque, alto contraste e movimento reduzido são preservadas.

## Validação

O contrato correspondente é:

`src/cli/validateGeneratedFrontendOfflineCacheWarningTextReflow.ts`

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_TEXT_REFLOW_OK:Produto:checks=10:passed=10
```
