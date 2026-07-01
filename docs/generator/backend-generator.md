# Gerador Backend

## Objetivo

Gerar artefatos ASP.NET Core a partir do modelo intermediário `ResolvedForm`.

A versão atual gera um CRUD backend mínimo sobre a arquitetura genérica já usada nos pilotos manuais:

```text
ResolvedForm -> Entity + DTO + Validator + Service + Controller + DbContext snippet
```

## Entrada

O gerador recebe um `ResolvedForm`, produzido pelo comando:

```bash
pnpm --filter @gestor/delphi-parser resolve:form <arquivo.dfm> <arquivo.pas> <entidade> [tabela]
```

## Saída atual

Arquivos gerados:

```text
apps/backend/Entities/<Entidade>.cs
apps/backend/DTO/<Entidade>Dto.cs
apps/backend/Validators/<Entidade>Validator.cs
apps/backend/Services/<Entidade>Service.cs
apps/backend/Controllers/<Entidade>Controller.cs
apps/backend/Generated/<Entidade>DbContextRegistration.cs.txt
```

## CLI

O arquivo de CLI foi adicionado em:

```text
packages/delphi-parser/src/cli/generateBackend.ts
```

Uso:

```bash
pnpm --filter @gestor/delphi-parser gen:backend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]
```

## Mapeamento inicial de tipos

A primeira heurística usa o nome do campo:

- `valor`, `preco`, `total`, `quantidade`, `qtd` -> `decimal?`
- `id`, sufixo `id`, `codigo` -> `int?`
- `data` -> `DateTime?`
- demais campos -> `string?`

## Validações

Campos marcados como obrigatórios no `ResolvedForm` geram checks no validator:

```csharp
if (string.IsNullOrWhiteSpace(input.Campo?.ToString())) errors.Add("Mensagem inferida");
```

As mensagens são aproveitadas dos hints de validação extraídos do PAS quando disponíveis.

## Registro no DbContext

O gerador emite um arquivo `.txt` com o trecho sugerido para registrar a entidade no `GestorDbContext`:

```csharp
public DbSet<Entidade> Entidades => Set<Entidade>();
```

Nesta etapa, o gerador ainda não edita automaticamente o `GestorDbContext` para evitar sobrescrever código manual.

## Próximas etapas

- Gerar configuração EF Core completa;
- Gerar migration ou instruções de migration;
- Melhorar inferência de tipos por metadados de dataset;
- Incluir relatório de lacunas para revisão manual.
