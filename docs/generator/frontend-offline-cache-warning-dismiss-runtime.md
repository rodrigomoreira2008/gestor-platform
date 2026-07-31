# Frontend offline cache warning dismiss runtime

Esta camada permite dispensar o alerta visual de cache offline antigo sem ocultar o indicador compacto de conectividade nem remover os anúncios acessíveis existentes.

## Gerador

Arquivo:

`packages/delphi-parser/src/frontendOfflineCacheWarningDismissGenerator.ts`

A camada envolve `frontendOfflineCacheRecordCountGenerator` e altera somente a página gerada da entidade.

## Estado local

A página recebe o estado:

```tsx
const [isOfflineCacheWarningDismissed, setOfflineCacheWarningDismissed] = useState(false);
```

## Condição do alerta

O alerta continua exigindo consulta pausada, registros disponíveis e cache antigo, mas passa a verificar também:

```tsx
!isOfflineCacheWarningDismissed
```

## Ação de fechamento

O alerta recebe:

```tsx
onClose={() => setOfflineCacheWarningDismissed(true)}
```

A dispensa vale somente durante a montagem atual da página. O `Chip` de cache antigo, a idade relativa, o horário de sincronização e a região `aria-live` permanecem ativos.

## Contrato

O validador correspondente é:

`packages/delphi-parser/src/cli/validateGeneratedFrontendOfflineCacheWarningDismiss.ts`

Marcador esperado:

```text
FRONTEND_OFFLINE_CACHE_WARNING_DISMISS_OK:<entity>:checks=10:passed=10
```
