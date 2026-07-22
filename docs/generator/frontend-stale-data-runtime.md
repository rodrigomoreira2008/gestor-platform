# Frontend stale data runtime

## Objetivo

Sinalizar quando a listagem gerada está exibindo dados considerados desatualizados pelo React Query, sem remover o conteúdo já disponível.

## Comportamento gerado

A página usa `list.isStale` para renderizar um `Chip` discreto com o texto `Dados em cache`.

O indicador só aparece quando:

- a consulta está marcada como stale;
- não há atualização em andamento;
- existem registros carregados.

Durante um refetch, o chip é substituído pelo `LinearProgress` de atualização em segundo plano. A ação manual `Atualizar` continua disponível na toolbar.

## Acessibilidade

O chip inclui o rótulo `A listagem pode estar desatualizada`, permitindo que tecnologias assistivas comuniquem o estado sem depender apenas da cor.

## Validação

O contrato é executado por:

```bash
pnpm exec tsx src/cli/validateGeneratedFrontendStaleData.ts <dfm> <pas> <entidade> <tabela>
```

Marcador esperado:

```text
FRONTEND_STALE_DATA_OK:<entidade>:checks=10:passed=10
```
