import type { ResolvedField, ResolvedForm } from './resolvedForm';

export interface BackendGeneratedFile {
  path: string;
  content: string;
}

export interface BackendGeneratorOptions {
  namespace?: string;
  outputRoot?: string;
}

export function generateBackendFiles(resolved: ResolvedForm, options: BackendGeneratorOptions = {}): BackendGeneratedFile[] {
  const entityName = toPascalCase(resolved.form.entity);
  const namespace = options.namespace ?? 'Gestor.Api';
  const outputRoot = options.outputRoot ?? 'apps/backend';

  return [
    { path: `${outputRoot}/Entities/${entityName}.cs`, content: generateEntity(entityName, resolved.fields, namespace) },
    { path: `${outputRoot}/DTO/${entityName}Dto.cs`, content: generateDto(entityName, resolved.fields, namespace) },
    { path: `${outputRoot}/Validators/${entityName}Validator.cs`, content: generateValidator(entityName, resolved.fields, namespace) },
    { path: `${outputRoot}/Services/${entityName}Service.cs`, content: generateService(entityName, resolved.fields, namespace) },
    { path: `${outputRoot}/Controllers/${entityName}Controller.cs`, content: generateController(entityName, resolved.form.entity, namespace) },
    { path: `${outputRoot}/Configurations/${entityName}Configuration.cs`, content: generateEntityConfiguration(entityName, resolved, namespace) },
    { path: `${outputRoot}/Generated/${entityName}DbContextRegistration.cs.txt`, content: generateDbContextRegistration(entityName) },
    { path: `${outputRoot}/Generated/${entityName}MigrationCommands.md`, content: generateMigrationCommands(entityName) }
  ];
}

function generateEntity(entityName: string, fields: ResolvedField[], namespace: string): string {
  return `using ${namespace}.Common;

namespace ${namespace}.Entities;

public class ${entityName} : IEntity
{
    public int Id { get; set; }
${fields.map((field) => `    public ${mapCSharpType(field)} ${toPascalCase(field.name)} { get; set; }`).join('\n')}
}
`;
}

function generateDto(entityName: string, fields: ResolvedField[], namespace: string): string {
  return `namespace ${namespace}.DTO;

public class ${entityName}Dto
{
    public int Id { get; set; }
${fields.map((field) => `    public ${mapCSharpType(field)} ${toPascalCase(field.name)} { get; set; }`).join('\n')}
}
`;
}

function generateValidator(entityName: string, fields: ResolvedField[], namespace: string): string {
  const rules = fields.flatMap(generateFieldValidationRules).join('\n');

  return `using System.Net.Mail;
using ${namespace}.Common;
using ${namespace}.DTO;

namespace ${namespace}.Validators;

public class ${entityName}Validator : IValidator<${entityName}Dto>
{
    public IReadOnlyList<string> Validate(${entityName}Dto input)
    {
        ArgumentNullException.ThrowIfNull(input);
        var errors = new List<string>();
${rules || '        // Nenhuma validação inferida automaticamente.'}
        return errors.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
    }

    private static bool IsValidEmail(string value)
    {
        try
        {
            _ = new MailAddress(value);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
`;
}

function generateFieldValidationRules(field: ResolvedField): string[] {
  const propertyName = toPascalCase(field.name);
  const type = mapCSharpType(field);
  const label = field.label ?? propertyName;
  const messages = Array.from(new Set(field.validationMessages.map((message) => message.trim()).filter(Boolean)));
  const requiredMessage = messages.find((message) => /obrigat|inform|preench|necessar/i.test(message)) ?? `${label} é obrigatório.`;
  const rules: string[] = [];

  if (field.required) {
    if (type === 'string?') {
      rules.push(`        if (string.IsNullOrWhiteSpace(input.${propertyName})) errors.Add("${escapeCSharpString(requiredMessage)}");`);
    } else {
      rules.push(`        if (input.${propertyName} is null) errors.Add("${escapeCSharpString(requiredMessage)}");`);
    }
  }

  if (type === 'string?') {
    const maxLength = inferMaximumLength(messages);
    if (maxLength) rules.push(`        if (input.${propertyName}?.Length > ${maxLength}) errors.Add("${escapeCSharpString(`${label} deve ter no máximo ${maxLength} caracteres.`)}");`);
    if (isEmailField(field, messages)) rules.push(`        if (!string.IsNullOrWhiteSpace(input.${propertyName}) && !IsValidEmail(input.${propertyName})) errors.Add("${escapeCSharpString(`${label} deve conter um e-mail válido.`)}");`);
  }

  if (type === 'decimal?' || type === 'int?') {
    if (messages.some((message) => /maior que zero|positivo|superior a zero/i.test(message))) {
      const message = messages.find((item) => /maior que zero|positivo|superior a zero/i.test(item)) ?? `${label} deve ser maior que zero.`;
      rules.push(`        if (input.${propertyName} is not null && input.${propertyName} <= 0) errors.Add("${escapeCSharpString(message)}");`);
    } else if (messages.some((message) => /não pode ser negativo|nao pode ser negativo|maior ou igual a zero/i.test(message))) {
      const message = messages.find((item) => /não pode ser negativo|nao pode ser negativo|maior ou igual a zero/i.test(item)) ?? `${label} não pode ser negativo.`;
      rules.push(`        if (input.${propertyName} is not null && input.${propertyName} < 0) errors.Add("${escapeCSharpString(message)}");`);
    }
  }

  for (const message of messages) {
    if (message === requiredMessage) continue;
    if (/maior que zero|positivo|superior a zero|não pode ser negativo|nao pode ser negativo|maior ou igual a zero|caracter|e-mail|email/i.test(message)) continue;
    rules.push(`        // Regra Pascal para revisão manual em ${propertyName}: ${escapeCSharpComment(message)}`);
  }

  return rules;
}

function inferMaximumLength(messages: string[]): number | undefined {
  for (const message of messages) {
    const match = message.match(/(?:máximo|maximo|até|ate)\s+(\d+)\s+caracter/i) ?? message.match(/(\d+)\s+caracter/i);
    if (match?.[1]) return Number.parseInt(match[1], 10);
  }
  return undefined;
}

function isEmailField(field: ResolvedField, messages: string[]): boolean {
  return /email|e-mail/i.test(field.name) || messages.some((message) => /email|e-mail/i.test(message));
}

function generateService(entityName: string, fields: ResolvedField[], namespace: string): string {
  return `using ${namespace}.Common;
using ${namespace}.DTO;
using ${namespace}.Entities;
using ${namespace}.Validators;

namespace ${namespace}.Services;

public class ${entityName}Service : CrudService<${entityName}, ${entityName}Dto>
{
    public ${entityName}Service(CrudRepository<${entityName}> repository, ${entityName}Validator validator) : base(repository, validator)
    {
    }

    protected override ${entityName}Dto ToDto(${entityName} entity)
    {
        return new ${entityName}Dto
        {
            Id = entity.Id,
${fields.map((field) => `            ${toPascalCase(field.name)} = entity.${toPascalCase(field.name)}`).join(',\n')}
        };
    }

    protected override ${entityName} ToEntity(${entityName}Dto input)
    {
        return new ${entityName}
        {
            Id = input.Id,
${fields.map((field) => `            ${toPascalCase(field.name)} = input.${toPascalCase(field.name)}`).join(',\n')}
        };
    }
}
`;
}

function generateController(entityName: string, entitySlug: string, namespace: string): string {
  return `using ${namespace}.Common;
using ${namespace}.DTO;
using ${namespace}.Entities;
using ${namespace}.Services;
using Microsoft.AspNetCore.Mvc;

namespace ${namespace}.Controllers;

[ApiController]
[Route("api/${toKebabPlural(entitySlug)}")]
public class ${entityName}Controller : CrudControllerBase<${entityName}, ${entityName}Dto, ${entityName}Service>
{
    public ${entityName}Controller(${entityName}Service service) : base(service)
    {
    }
}
`;
}

function generateEntityConfiguration(entityName: string, resolved: ResolvedForm, namespace: string): string {
  const tableName = resolved.databaseQueries[0]?.tables[0]?.name ?? resolved.form.table ?? entityName;
  const relationshipNotes = resolved.relationships.map((relationship) => `        // Relacionamento inferido (${relationship.confidence}): ${relationship.sourceTable}.${relationship.sourceColumn} -> ${relationship.targetTable}.${relationship.targetColumn}`).join('\n');

  return `using ${namespace}.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ${namespace}.Configurations;

public class ${entityName}Configuration : IEntityTypeConfiguration<${entityName}>
{
    public void Configure(EntityTypeBuilder<${entityName}> builder)
    {
        builder.ToTable("${escapeCSharpString(tableName)}");
        builder.HasKey(entity => entity.Id);
${resolved.fields.map((field) => `        builder.Property(entity => entity.${toPascalCase(field.name)}).HasColumnName("${escapeCSharpString(field.dataField ?? field.name)}");`).join('\n')}
${relationshipNotes || '        // Nenhum relacionamento inferido automaticamente.'}
    }
}
`;
}

function generateDbContextRegistration(entityName: string): string {
  return `// Adicionar em GestorDbContext.cs
public DbSet<${entityName}> ${entityName}s => Set<${entityName}>();

// Adicionar em OnModelCreating:
// modelBuilder.ApplyConfiguration(new ${entityName}Configuration());

// Conferir usings:
// using Gestor.Api.Entities;
// using Gestor.Api.Configurations;
`;
}

function generateMigrationCommands(entityName: string): string {
  return `# Migration EF Core para ${entityName}

Depois de copiar os arquivos gerados para o projeto backend e registrar a entidade no DbContext, execute:

\`\`\`bash
dotnet ef migrations add Add${entityName} --project apps/backend --startup-project apps/backend

dotnet ef database update --project apps/backend --startup-project apps/backend
\`\`\`

## Checklist antes de executar

- Conferir \`DbSet<${entityName}>\` no DbContext.
- Conferir \`modelBuilder.ApplyConfiguration(new ${entityName}Configuration())\`.
- Revisar tipos inferidos automaticamente.
- Revisar relacionamentos marcados como \`medium\` ou \`low\` no relatorio de migracao.
`;
}

function mapCSharpType(field: ResolvedField): string {
  const normalized = field.name.toLowerCase();
  if (normalized.includes('valor') || normalized.includes('preco') || normalized.includes('total')) return 'decimal?';
  if (normalized.includes('quantidade') || normalized.includes('qtd')) return 'decimal?';
  if (normalized === 'id' || normalized.endsWith('id') || normalized.includes('codigo')) return 'int?';
  if (normalized.includes('data')) return 'DateTime?';
  return 'string?';
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toKebabPlural(value: string): string {
  const kebab = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}

function escapeCSharpString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ');
}

function escapeCSharpComment(value: string): string {
  return value.replace(/\r?\n/g, ' ').replace(/\*\//g, '* /').trim();
}
