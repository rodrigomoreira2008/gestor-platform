import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { generateBackendFiles, resolveDelphiForm } from '../index';

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:backend-runtime arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const dotnetVersion = spawnSync('dotnet', ['--version'], { encoding: 'utf8' });
if (dotnetVersion.error || dotnetVersion.status !== 0) {
  const output = { ok: false, entity, reason: 'dotnet SDK nao encontrado', detail: dotnetVersion.error?.message ?? dotnetVersion.stderr.trim() };
  console.log(json ? JSON.stringify(output, null, 2) : `ERRO: ${output.reason}. ${output.detail}`);
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const files = generateBackendFiles(resolved).filter((file) => file.path.endsWith('.cs'));
const entityName = toPascalCase(entity);
const tempRoot = mkdtempSync(join(tmpdir(), 'gestor-delphi-runtime-'));

try {
  writeFileSync(join(tempRoot, 'GeneratedBackendRuntime.csproj'), `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup><FrameworkReference Include="Microsoft.AspNetCore.App" /></ItemGroup>
</Project>\n`);

  for (const file of files) writeFileSync(join(tempRoot, basename(file.path)), file.content);
  writeFileSync(join(tempRoot, 'CommonStubs.cs'), commonStubs());
  writeFileSync(join(tempRoot, 'EntityFrameworkStubs.cs'), entityFrameworkStubs());
  writeFileSync(join(tempRoot, 'RelatedEntityStubs.cs'), relatedEntityStubs(files.map((file) => file.content).join('\n'), entityName));
  writeFileSync(join(tempRoot, 'Program.cs'), runtimeHarness(entityName));

  const run = spawnSync('dotnet', ['run', '--nologo', '--verbosity', 'quiet'], {
    cwd: tempRoot,
    encoding: 'utf8',
    env: { ...process.env, DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1' }
  });
  const combined = `${run.stdout ?? ''}\n${run.stderr ?? ''}`.trim();
  const runtimeMarker = combined.split(/\r?\n/).find((line) => line.startsWith('RUNTIME_OK:'));
  const diagnostics = combined.split(/\r?\n/).filter((line) => /error|exception|failed/i.test(line)).slice(0, 50);
  const output = {
    ok: run.status === 0 && Boolean(runtimeMarker),
    entity,
    sdk: dotnetVersion.stdout.trim(),
    generatedFiles: files.length,
    exitCode: run.status,
    runtimeMarker: runtimeMarker ?? null,
    diagnostics
  };

  if (json) console.log(JSON.stringify(output, null, 2));
  else {
    console.log(`Smoke test runtime do backend gerado de ${entity}`);
    console.log(`SDK .NET: ${output.sdk}`);
    console.log(`Arquivos C# executados: ${files.length}`);
    if (runtimeMarker) console.log(runtimeMarker);
    for (const diagnostic of diagnostics) console.error(diagnostic);
    console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
  }
  if (!output.ok) process.exitCode = 1;
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function runtimeHarness(entityName: string): string {
  return `using Gestor.Api.Common;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Gestor.Api.Services;
using Gestor.Api.Validators;

var validator = new ${entityName}Validator();
var repository = new CrudRepository<${entityName}>();
var service = new ${entityName}RuntimeProbe(repository, validator);
var dto = new ${entityName}Dto { Id = 42 };
Populate(dto);
var errors = validator.Validate(dto);
var mappedEntity = service.MapToEntity(dto);
var roundTrip = service.MapToDto(mappedEntity);
var mismatches = typeof(${entityName}Dto).GetProperties()
    .Where(property => !Equals(property.GetValue(dto), property.GetValue(roundTrip)))
    .Select(property => property.Name)
    .ToArray();
if (mappedEntity.Id != 42) throw new InvalidOperationException("Identity mapping failed.");
if (mismatches.Length > 0) throw new InvalidOperationException("Round-trip mismatch: " + string.Join(",", mismatches));
if (errors is null) throw new InvalidOperationException("Validator returned null.");
Console.WriteLine($"RUNTIME_OK:${entityName}:properties={typeof(${entityName}Dto).GetProperties().Length}:validationErrors={errors.Count}");

static void Populate(object target)
{
    foreach (var property in target.GetType().GetProperties().Where(property => property.CanWrite && property.Name != "Id"))
    {
        var type = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
        object? value = type == typeof(string) ? "Valor de teste"
            : type == typeof(int) ? 7
            : type == typeof(decimal) ? 12.5m
            : type == typeof(bool) ? true
            : type == typeof(DateTime) ? new DateTime(2025, 1, 2)
            : null;
        if (value is not null) property.SetValue(target, value);
    }
}

sealed class ${entityName}RuntimeProbe : ${entityName}Service
{
    public ${entityName}RuntimeProbe(CrudRepository<${entityName}> repository, ${entityName}Validator validator) : base(repository, validator) { }
    public ${entityName} MapToEntity(${entityName}Dto input) => ToEntity(input);
    public ${entityName}Dto MapToDto(${entityName} input) => ToDto(input);
}
`;
}

function commonStubs(): string {
  return `using Microsoft.AspNetCore.Mvc;
namespace Gestor.Api.Common;
public interface IEntity { int Id { get; set; } }
public interface IValidator<T> { IReadOnlyList<string> Validate(T input); }
public class CrudRepository<T> where T : class { }
public abstract class CrudService<TEntity, TDto> where TEntity : class {
    protected CrudService(CrudRepository<TEntity> repository, IValidator<TDto> validator) { }
    protected abstract TDto ToDto(TEntity entity);
    protected abstract TEntity ToEntity(TDto input);
}
public abstract class CrudControllerBase<TEntity, TDto, TService> : ControllerBase
    where TEntity : class where TService : CrudService<TEntity, TDto> {
    protected CrudControllerBase(TService service) { }
}
`;
}

function entityFrameworkStubs(): string {
  return `namespace Microsoft.EntityFrameworkCore;
public enum DeleteBehavior { Restrict }
namespace Microsoft.EntityFrameworkCore.Metadata.Builders;
public interface IEntityTypeConfiguration<T> where T : class { void Configure(EntityTypeBuilder<T> builder); }
public class EntityTypeBuilder<T> where T : class {
    public EntityTypeBuilder<T> ToTable(string name) => this;
    public KeyBuilder HasKey(System.Linq.Expressions.Expression<System.Func<T, object?>> expression) => new();
    public PropertyBuilder Property<TProperty>(System.Linq.Expressions.Expression<System.Func<T, TProperty>> expression) => new();
    public ReferenceNavigationBuilder<T, TRelated> HasOne<TRelated>(System.Linq.Expressions.Expression<System.Func<T, TRelated?>> expression) where TRelated : class => new();
}
public class KeyBuilder { }
public class PropertyBuilder { public PropertyBuilder HasColumnName(string name) => this; }
public class ReferenceNavigationBuilder<T, TRelated> where T : class where TRelated : class { public ReferenceCollectionBuilder<T, TRelated> WithMany() => new(); }
public class ReferenceCollectionBuilder<T, TRelated> where T : class where TRelated : class {
    public ReferenceCollectionBuilder<T, TRelated> HasForeignKey(System.Linq.Expressions.Expression<System.Func<T, object?>> expression) => this;
    public ReferenceCollectionBuilder<T, TRelated> HasPrincipalKey(System.Linq.Expressions.Expression<System.Func<TRelated, object?>> expression) => this;
    public ReferenceCollectionBuilder<T, TRelated> OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior behavior) => this;
}
`;
}

function relatedEntityStubs(content: string, currentEntity: string): string {
  const names = new Set<string>();
  for (const match of content.matchAll(/public\s+([A-Z][A-Za-z0-9_]*)\?\s+[A-Z][A-Za-z0-9_]*\s*\{\s*get;/g)) {
    if (match[1] && match[1] !== currentEntity && !['String', 'DateTime', 'Decimal', 'Int32'].includes(match[1])) names.add(match[1]);
  }
  return names.size === 0 ? 'namespace Gestor.Api.Entities;\n' : `namespace Gestor.Api.Entities;\n${[...names].map((name) => `public class ${name} { public int Id { get; set; } }`).join('\n')}\n`;
}

function toPascalCase(value: string): string {
  return value.replace(/(^|[_\-\s]+)([a-zA-Z0-9])/g, (_, __, character: string) => character.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
}
