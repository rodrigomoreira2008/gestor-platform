# Frontend offline cache warning scroll margin

A camada `frontendOfflineCacheWarningScrollMarginGenerator` adiciona margem de rolagem ao chip de alerta offline.

## Comportamento gerado

```tsx
scrollMarginBlock: 16,
scrollMarginInline: 8,
```

Essas propriedades ajudam a manter o controle visível quando ele recebe foco por teclado ou programaticamente, especialmente em páginas com cabeçalhos fixos ou áreas roláveis.

A camada preserva:

- área mínima de toque para `pointer: coarse`;
- suporte a cores forçadas;
- preferência por movimento reduzido;
- foco visível;
- estado desabilitado e atalhos condicionais.

## Validação

Use `validateGeneratedFrontendOfflineCacheWarningScrollMargin.ts` com os caminhos DFM e PAS, a entidade e a tabela.

O contrato verifica 10 características e emite o marcador:

```text
FRONTEND_OFFLINE_CACHE_WARNING_SCROLL_MARGIN_OK:<entidade>:checks=10:passed=10
```
