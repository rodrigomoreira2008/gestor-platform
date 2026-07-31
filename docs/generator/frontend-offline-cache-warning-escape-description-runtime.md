# Descrição acessível do atalho Escape

## Objetivo

A camada `frontendOfflineCacheWarningEscapeDescriptionGenerator` complementa o atalho de teclado do alerta de cache antigo com uma descrição acessível associada ao próprio alerta.

## Comportamento gerado

O alerta recebe:

```tsx
aria-describedby="offline-cache-warning-shortcut-description"
```

Dentro do alerta é incluído um texto visualmente oculto:

```tsx
<span id="offline-cache-warning-shortcut-description">
  Pressione Escape para dispensar este alerta.
</span>
```

O estilo mantém a descrição disponível para tecnologias assistivas sem modificar o layout visual.

## Garantias preservadas

- `aria-keyshortcuts="Escape"` continua declarado;
- a tecla Escape continua dispensando o alerta;
- a dispensa continua persistida na sessão;
- o foco continua retornando ao chip;
- o alerta permanece com `role="status"` e `tabIndex={-1}`.

## Contrato

Validador:

```text
src/cli/validateGeneratedFrontendOfflineCacheWarningEscapeDescription.ts
```

Marcador de sucesso esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_ESCAPE_DESCRIPTION_OK:<entidade>:checks=10:passed=10
```
