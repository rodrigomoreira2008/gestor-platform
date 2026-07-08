# Documentacao do Gerador Delphi

Indice dos documentos adicionados para o fluxo de migracao Delphi DFM/PAS.

## Comece aqui

- `quickstart.md`: fluxo rapido de comandos para resolver formulario, gerar backend, gerar frontend, gerar relatorio e validar artefatos.
- `pr-summary.md`: resumo executivo das entregas do PR.
- `pr-validation-checklist.md`: checklist final antes de mover artefatos para as aplicacoes reais.
- `migration-gaps.md`: lacunas conhecidas e pontos que ainda exigem revisao manual.
- `roadmap.md`: proximas evolucoes planejadas para o gerador.

## Componentes do gerador

- `pas-parser.md`: parser PAS, validacoes, fixtures e CI.
- `backend-generator.md`: artefatos ASP.NET Core gerados.
- `frontend-generator.md`: artefatos React/MUI gerados.

## Validacao recomendada

```bash
pnpm --filter @gestor/delphi-parser build
pnpm validate:delphi-fixtures
```

## Observacao

Os artefatos gerados devem passar por revisao tecnica antes de serem aplicados em producao, principalmente lookups, relacionamentos e grids detalhe inferidos com confianca media ou baixa.
