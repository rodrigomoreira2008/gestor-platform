import type { GestorField, GestorForm } from '@gestor/dsl';

export interface DotNetCrudFiles {
  entity: string;
  dto: string;
  controller: string;
  service: string;
  repository: string;
  validator: string;
}

export function generateDotNetCrud(form: GestorForm): DotNetCrudFiles {
  const className = toPascalCase(form.entity);

  return {
    entity: generateEntity(form, className),
    dto: generateDto(form, className),
    controller: generateController(form, className),
    service: generateService(className),
    repository: generateRepository(className),
    validator: generateValidator(form, className)
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
using Gestor.Api.Services;

namespace Gestor.Api.Controllers;

[ApiController]
[Route("api/${route}")]
public class ${className}Controller : ControllerBase
{
    private readonly ${className}Service _service;

    public ${className}Controller(${className}Service service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<${className}Dto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<${className}Dto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<${className}Dto>> Create(${className}Dto input, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(input, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ${className}Dto input, CancellationToken cancellationToken)
    {
        await _service.UpdateAsync(id, input, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
`;
}

function generateService(className: string): string {
  return `using Gestor.Api.DTO;
using Gestor.Api.Repositories;

namespace Gestor.Api.Services;

public class ${className}Service
{
    private readonly ${className}Repository _repository;

    public ${className}Service(${className}Repository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<${className}Dto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return _repository.GetAllAsync(cancellationToken);
    }

    public Task<${className}Dto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return _repository.GetByIdAsync(id, cancellationToken);
    }

    public Task<${className}Dto> CreateAsync(${className}Dto input, CancellationToken cancellationToken)
    {
        return _repository.CreateAsync(input, cancellationToken);
    }

    public Task UpdateAsync(int id, ${className}Dto input, CancellationToken cancellationToken)
    {
        input.Id = id;
        return _repository.UpdateAsync(input, cancellationToken);
    }

    public Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        return _repository.DeleteAsync(id, cancellationToken);
    }
}
`;
}

function generateRepository(className: string): string {
  return `using Gestor.Api.DTO;

namespace Gestor.Api.Repositories;

public class ${className}Repository
{
    private static readonly List<${className}Dto> Items = [];

    public Task<IEnumerable<${className}Dto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult<IEnumerable<${className}Dto>>(Items);
    }

    public Task<${className}Dto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return Task.FromResult(Items.FirstOrDefault(item => item.Id == id));
    }

    public Task<${className}Dto> CreateAsync(${className}Dto input, CancellationToken cancellationToken)
    {
        input.Id = Items.Count == 0 ? 1 : Items.Max(item => item.Id) + 1;
        Items.Add(input);
        return Task.FromResult(input);
    }

    public Task UpdateAsync(${className}Dto input, CancellationToken cancellationToken)
    {
        var index = Items.FindIndex(item => item.Id == input.Id);
        if (index >= 0) Items[index] = input;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        Items.RemoveAll(item => item.Id == id);
        return Task.CompletedTask;
    }
}
`;
}

function generateValidator(form: GestorForm, className: string): string {
  const requiredRules = form.fields
    .filter((field) => field.required && field.type !== 'grid')
    .map((field) => `        if (input.${toPascalCase(field.name)} is null) errors.Add("${toPascalCase(field.name)} é obrigatório.");`)
    .join('\n');

  return `using Gestor.Api.DTO;

namespace Gestor.Api.Validators;

public class ${className}Validator
{
    public IReadOnlyList<string> Validate(${className}Dto input)
    {
        var errors = new List<string>();
${requiredRules || '        // Sem regras obrigatórias detectadas pela DSL neste momento.'}
        return errors;
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
