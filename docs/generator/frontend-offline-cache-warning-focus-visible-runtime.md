# Foco visível do alerta de cache offline

A camada `frontendOfflineCacheWarningFocusVisibleGenerator` acrescenta um indicador visual explícito ao chip que mostra ou restaura o alerta de cache antigo.

## Comportamento gerado

```tsx
sx={{
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'primary.main',
    outlineOffset: '2px'
  }
}}
```

O contorno aparece somente quando o foco é considerado visível pelo navegador, preservando a experiência de clique com mouse e destacando a navegação por teclado.

A camada mantém o estado condicional do controle:

- o chip entra na ordem de foco somente quando `isOfflineCacheOld` é verdadeiro;
- `aria-disabled` informa indisponibilidade nos demais estados;
- `aria-keyshortcuts` anuncia `Enter` e `Space` apenas quando o controle pode ser acionado.

## Contrato

O validador `validateGeneratedFrontendOfflineCacheWarningFocusVisible.ts` verifica 10 elementos estruturais, incluindo o seletor `:focus-visible`, espessura, cor, afastamento, disponibilidade, atalhos e semântica de botão.

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_FOCUS_VISIBLE_OK:Produto:checks=10:passed=10
```
