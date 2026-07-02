# Gerador Backend

## Objetivo

Gerar artefatos ASP.NET Core a partir do modelo intermediario ResolvedForm.

A versao atual gera um CRUD backend minimo sobre a arquitetura generica ja usada nos pilotos manuais:

```text
ResolvedForm -> Entity + DTO + Validator + Service + Controller + EF Configuration + DbContext snippet + Migration commands
```

## Entrada

O gerador recebe um ResolvedForm, produzido pelo comando:

```bash
pnpm --filter @gestor/delphi-parser resolve:form arquivo.dfm arquivo.pas Entidade tabela
```

## Saida atual

Arquivos gerados:

```text
apps/backend/Entities/Entidade.cs
apps/backend/DTO/EntidadeDto.cs
apps/backend/Validators/EntidadeValidator.cs
apps/backend/Services/EntidadeService.cs
apps/backend/Controllers/EntidadeController.cs
apps/backend/Configurations/EntidadeConfiguration.cs
apps/backend/Generated/EntidadeDbContextRegistration.cs.txt
apps/backend/Generated/EntidadeMigrationCommands.md
```

## CLI

Uso:

```bash
pnpm --filter @gestor/delphi-parser gen:backend arquivo.dfm arquivo.pas Entidade tabela saida
```

## Mapeamento inicial de tipos

A primeira heuristica usa o nome do campo:

- valor, preco, total, quantidade, qtd -> decimal opcional
- id, sufixo id, codigo -> int opcional
- data -> DateTime opcional
- demais campos -> string opcional

## Validacoes

Campos marcados como obrigatorios no ResolvedForm geram checks no validator. As mensagens sao aproveitadas dos hints de validacao extraidos do PAS quando disponiveis.

## EF Core Configuration

O gerador emite Configurations/EntidadeConfiguration.cs com:

- mapeamento de tabela inferida do SQL quando disponivel;
- chave primaria Id;
- mapeamento de colunas para os campos resolvidos;
- comentarios para relacionamentos inferidos automaticamente.

## Registro no DbContext

O gerador emite um arquivo txt com o trecho sugerido para registrar a entidade no GestorDbContext:

```csharp
public DbSet<Entidade> Entidades => Set<Entidade>();
modelBuilder.ApplyConfiguration(new EntidadeConfiguration());
```

Nesta etapa, o gerador ainda nao edita automaticamente o GestorDbContext para evitar sobrescrever codigo manual.

## Migrations

O gerador tambem emite Generated/EntidadeMigrationCommands.md com comandos sugeridos para criar migration e atualizar o banco.

## Proximas etapas

- Gerar relacionamentos Fluent API reais quando a confianca for alta;
- Melhorar inferencia de tipos por metadados de dataset;
- Gerar indices e constraints a partir de SQL e eventos Delphi;
- Incluir validacoes de build para os artefatos gerados.
