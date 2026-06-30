import type { GestorField, GestorForm } from '@gestor/dsl';

export interface DotNetCrudFiles {
  entity: string;
  dto: string;
  controller: string;
}

export function generateDotNetCrud(form: GestorForm): DotNetCrudFiles {
  const className = toPascalCase(form.entity);

  return {
    entity: generateEntity(form, className),
    dto: generateDto(form, className),
    controller: generateController(form, className)
  };
}

function generateEntity(form: GestorForm, className: string): string {
  const properties = form.fields
    .filter((field) => field.type !== 'grid')
    .map((field) => `    public ${toCSharpType(field)} ${toPascalCase(field.name)} { get; set; }`)
    .join('\n');

  return `namespace Gestor.Api.Entities;

public class ${className}
{
    public int Id { get; set; }
${properties}
}
`;
}

function generateDto(form: GestorForm, className: string): string {
  const properties = form.fields
    .filter((field) => field.type !== 'grid')
    .map((field) => `    public ${toCSharpType(field)} ${toPascalCase(field.name)} { get; set; }`)
    .join('\n');

  return `namespace Gestor.Api.DTO;

public class ${className}Dto
{
    public int Id { get; set; }
${properties}
}
`;
}

function generateController(form: GestorForm, className: string): string {
  const route = toKebabCase(form.entity);

  return `using Microsoft.AspNetCore.Mvc;
using Gestor.Api.DTO;

namespace Gestor.Api.Controllers;

[ApiController]
[Route("api/${route}")]
public class ${className}Controller : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<${className}Dto>> GetAll()
    {
        return Ok(Array.Empty<${className}Dto>());
    }

    [HttpGet("{id:int}")]
    public ActionResult<${className}Dto> GetById(int id)
    {
        return NotFound();
    }

    [HttpPost]
    public ActionResult<${className}Dto> Create(${className}Dto input)
    {
        return CreatedAtAction(nameof(GetById), new { id = input.Id }, input);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, ${className}Dto input)
    {
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        return NoContent();
    }
}
`;
}

function toCSharpType(field: GestorField): string {
  switch (field.type) {
    case 'integer':
      return 'int?';
    case 'decimal':
    case 'money':
      return 'decimal?';
    case 'date':
    case 'datetime':
      return 'DateTime?';
    case 'boolean':
      return 'bool?';
    default:
      return 'string?';
  }
}

function toPascalCase(value: string): string {
  const result = value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  return result || 'GeneratedEntity';
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
