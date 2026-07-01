# Gerador Backend

## Objetivo

Gerar artefatos ASP.NET Core a partir do modelo intermediário `ResolvedForm`.

Nesta primeira versão, o gerador cria os arquivos mínimos de entidade e DTO para validar o fluxo:

```text
ResolvedForm -> Entity C# + DTO C#
```

## Entrada

O gerador recebe um `ResolvedForm`, produzido pelo comando:

```bash
pnpm --filter @gestor/delphi-parser resolve:form <arquivo.dfm> <arquivo.pas> <entidade> [tabela]
```

## Saída inicial

Arquivos gerados:

```text
apps/backend/Entities/<Entidade>.cs
apps/backend/DTO/<Entidade>Dto.cs
```

## CLI

O arquivo de CLI foi adicionado em:

```text
packages/delphi-parser/src/cli/generateBackend.ts
```

Uso planejado:

```bash
pnpm --filter @gestor/delphi-parser generate:backend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]
```

Observação: o registro do script no `package.json` pode ser aplicado manualmente se o conector bloquear a alteração:

```json
"generate:backend": "tsx src/cli/generateBackend.ts"
```

## Mapeamento inicial de tipos

A primeira heurística usa o nome do campo:

- `valor`, `preco`, `total`, `quantidade`, `qtd` -> `decimal?`
- `id`, sufixo `id`, `codigo` -> `int?`
- `data` -> `DateTime?`
- demais campos -> `string?`

## Próximas etapas

- Gerar validator;
- Gerar service;
- Gerar controller;
- Gerar configuração EF Core;
- Gerar migration ou instruções de migration;
- Incluir relatório de lacunas para revisão manual.
