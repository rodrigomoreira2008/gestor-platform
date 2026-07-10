# Documentacao do Gerador Delphi

Indice dos documentos adicionados para o fluxo de migracao Delphi DFM/PAS.

## Comece aqui

- `quickstart.md`: fluxo rapido de comandos para resolver formulario, gerar backend, gerar frontend, gerar relatorio e validar artefatos.
- `../../packages/delphi-parser/README.md`: visao geral do pacote, comandos e estrutura interna.
- `pr-summary.md`: resumo executivo das entregas do PR.
- `pr-validation-checklist.md`: checklist final antes de mover artefatos para as aplicacoes reais.
- `acceptance-criteria.md`: criterios objetivos para considerar uma tela pronta para revisao funcional.
- `component-mapping.md`: guia para mapear componentes Delphi customizados ou herdados.
- `migration-gaps.md`: lacunas conhecidas e pontos que ainda exigem revisao manual.
- `roadmap.md`: proximas evolucoes planejadas para o gerador.
- `review-guidelines.md`: guia de revisao tecnica dos artefatos gerados.
- `release-notes.md`: notas desta entrega do gerador Delphi.
- `troubleshooting.md`: diagnostico de problemas comuns no parser/gerador.

## Componentes do gerador

- `pas-parser.md`: parser PAS, validacoes, fixtures e CI.
- `backend-generator.md`: artefatos ASP.NET Core gerados.
- `frontend-generator.md`: artefatos React/MUI gerados.

## Validacao recomendada

```bash
pnpm --filter @gestor/delphi-parser validate:all
```

O comando executa build, validacao do catalogo, auditoria dos DFM de fixture e validacao dos artefatos gerados.

## Observacao

Os artefatos gerados devem passar por revisao tecnica antes de serem aplicados em producao, principalmente lookups, relacionamentos e grids detalhe inferidos com confianca media ou baixa.
