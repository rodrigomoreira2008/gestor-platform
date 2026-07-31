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
pnpm --filter @gestor/delphi-parser validate:backend arquivo.dfm arquivo.pas Entidade tabela
```

O comando validate:backend resolve o formulario, gera os artefatos em memoria e valida se os grupos obrigatorios foram emitidos, se ha arquivos vazios, paths duplicados e arquivos C# sem estrutura basica de namespace/blocos.

## Mapeamento inicial de tipos

A primeira heuristica usa o nome do campo:

- valor, preco, total, quantidade, qtd -> decimal opcional
- id, sufixo id, codigo -> int opcional
- data -> DateTime opcional
- demais campos -> string opcional

O campo ID resolvido no DFM nao e emitido novamente, porque a entidade e o DTO ja possuem a propriedade Id estrutural. Isso evita propriedades duplicadas no C# gerado.

## Validacoes

Campos marcados como obrigatorios no ResolvedForm geram checks no validator. As mensagens sao aproveitadas dos hints de validacao extraidos do PAS quando disponiveis.

O validator distingue strings, numeros e datas e tenta converter textos Pascal em regras concretas para:

- obrigatoriedade;
- tamanho maximo;
- e-mail valido;
- valor maior que zero;
- valor nao negativo.

Regras que nao podem ser convertidas com seguranca permanecem como comentarios para revisao manual.

## EF Core Configuration

O gerador emite Configurations/EntidadeConfiguration.cs com:

- mapeamento de tabela inferida do SQL quando disponivel;
- chave primaria Id;
- mapeamento de colunas para os campos resolvidos;
- relacionamentos Fluent API reais quando a direcao e a FK possuem alta confianca;
- comentarios para relacionamentos ambiguos ou de confianca media/baixa.

### Direcao dos relacionamentos

A inferencia analisa as igualdades dos JOINs e tenta identificar:

- tabela dependente;
- coluna de chave estrangeira;
- tabela principal;
- coluna principal.

A direcao tem maior confianca quando um lado usa ID, CODIGO ou CONTROLE e o outro lado parece uma FK, por exemplo GRUPO_ID.

Quando o formulario atual representa a tabela dependente e o campo de FK existe entre os campos resolvidos, o gerador adiciona:

```csharp
public GrupoProduto? GrupoProduto { get; set; }
```

E gera configuracao equivalente a:

```csharp
builder.HasOne(entity => entity.GrupoProduto)
    .WithMany()
    .HasForeignKey(entity => entity.GrupoId)
    .HasPrincipalKey(entity => entity.Id)
    .OnDelete(DeleteBehavior.Restrict);
```

A exclusao usa Restrict por seguranca, evitando cascatas inferidas automaticamente.

## Registro no DbContext

O gerador emite um arquivo txt com o trecho sugerido para registrar a entidade no GestorDbContext:

```csharp
public DbSet<Entidade> Entidades => Set<Entidade>();
modelBuilder.ApplyConfiguration(new EntidadeConfiguration());
```

Quando uma FK de alta confianca e gerada, o snippet tambem lembra de confirmar o DbSet e a chave da entidade relacionada.

Nesta etapa, o gerador ainda nao edita automaticamente o GestorDbContext para evitar sobrescrever codigo manual.

## Migrations

O gerador tambem emite Generated/EntidadeMigrationCommands.md com comandos sugeridos para criar migration e atualizar o banco.

O checklist da migration inclui cada FK gerada, facilitando a revisao antes de aplicar alteracoes no banco.

## Validacao dos artefatos

O comando validate:backend foi criado para rodar antes de copiar artefatos para a aplicacao real. Ele verifica:

- presenca de Entity, DTO, Validator, Service, Controller, Configuration e Generated;
- arquivos vazios;
- paths duplicados;
- estrutura C# basica nos arquivos .cs.

## Proximas etapas

- Melhorar inferencia de tipos por metadados de dataset;
- Gerar indices e constraints a partir de SQL e eventos Delphi;
- Inferir cardinalidade um-para-um e colecoes de navegacao;
- Expandir validate:backend para compilacao temporaria dos arquivos gerados.
