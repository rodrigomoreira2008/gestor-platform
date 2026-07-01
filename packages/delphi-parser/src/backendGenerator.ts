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
    {
      path: `${outputRoot}/Entities/${entityName}.cs`,
      content: generateEntity(entityName, resolved.fields, namespace)
    },
    {
      path: `${outputRoot}/DTO/${entityName}Dto.cs`,
      content: generateDto(entityName, resolved.fields, namespace)
    },
    {
      path: `${outputRoot}/Validators/${entityName}Validator.cs`,
      content: generateValidator(entityName, resolved.fields, namespace)
    },
    {
      path: `${outputRoot}/Services/${entityName}Service.cs`,
      content: generateService(entityName, resolved.fields, namespace)
    },
    {
      path: `${outputRoot}/Controllers/${entityName}Controller.cs`,
      content: generateController(entityName, resolved.form.entity, namespace)
    },
    {
      path: `${outputRoot}/Generated/${entityName}DbContextRegistration.cs.txt`,
      content: generateDbContextRegistration(entityName)
    }
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
  const requiredChecks = fields
    .filter((field) => field.required)
    .map((field) => {
      const propertyName = toPascalCase(field.name);
      const message = field.validationMessages[0] ?? `${field.label ?? propertyName} é obrigatório.`;
      return `        if (string.IsNullOrWhiteSpace(input.${propertyName}?.ToString())) errors.Add("${escapeCSharpString(message)}");`;
    })
    .join('\n');

  return `using ${namespace}.Common;
using ${namespace}.DTO;

namespace ${namespace}.Validators;

public class ${entityName}Validator : IValidator<${entityName}Dto>
{
    public IReadOnlyList<string> Validate(${entityName}Dto input)
    {
        var errors = new List<string>();
${requiredChecks || '        // Nenhuma validação obrigatória inferida automaticamente.'}
        return errors;
    }
}
`;
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

function generateDbContextRegistration(entityName: string): string {
  return `// Adicionar em GestorDbContext.cs
public DbSet<${entityName}> ${entityName}s => Set<${entityName}>();

// Conferir se existe using da entidade gerada:
// using Gestor.Api.Entities;
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
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toKebabPlural(value: string): string {
  const kebab = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}

function escapeCSharpString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
