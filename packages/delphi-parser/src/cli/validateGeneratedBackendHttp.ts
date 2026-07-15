import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { generateBackendFiles, resolveDelphiForm } from '../index';

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:backend-http arquivo.dfm arquivo.pas entidade [tabela] [--json]');
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
const controller = files.find((file) => file.path.endsWith(`/${entity}Controller.cs`));
const route = controller?.content.match(/\[Route\("([^"]+)"\)\]/)?.[1];
if (!route) {
  console.error(`Nao foi possivel localizar a rota do controller de ${entity}.`);
  process.exit(1);
}

const port = await findFreePort();
const tempRoot = mkdtempSync(join(tmpdir(), 'gestor-delphi-http-'));

try {
  writeFileSync(join(tempRoot, 'GeneratedHttp.csproj'), `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
`);

  for (const file of files) writeFileSync(join(tempRoot, basename(file.path)), file.content);
  writeFileSync(join(tempRoot, 'CommonStubs.cs'), commonStubs());
  writeFileSync(join(tempRoot, 'EntityFrameworkStubs.cs'), entityFrameworkStubs());
  writeFileSync(join(tempRoot, 'RelatedEntityStubs.cs'), relatedEntityStubs(files.map((file) => file.content).join('\n'), entity));
  writeFileSync(join(tempRoot, 'Program.cs'), programSource(entity, route, port));

  const run = spawnSync('dotnet', ['run', '--no-launch-profile'], {
    cwd: tempRoot,
    encoding: 'utf8',
    timeout: 120000,
    env: { ...process.env, DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1' }
  });

  const combined = `${run.stdout ?? ''}\n${run.stderr ?? ''}`.trim();
  const marker = combined.split(/\r?\n/).find((line) => line.startsWith('HTTP_RUNTIME_OK:')) ?? null;
  const diagnostics = combined.split(/\r?\n/).filter((line) => /\berror\s+CS\d+|Unhandled exception|HTTP_RUNTIME_FAIL|Build FAILED/i.test(line)).slice(0, 50);
  const output = {
    ok: run.status === 0 && marker !== null,
    entity,
    route,
    sdk: dotnetVersion.stdout.trim(),
    generatedFiles: files.length,
    exitCode: run.status,
    runtimeMarker: marker,
    diagnostics
  };

  if (json) console.log(JSON.stringify(output, null, 2));
  else {
    console.log(`Smoke test HTTP do backend gerado de ${entity}`);
    console.log(`Rota: /${route}`);
    console.log(`SDK .NET: ${output.sdk}`);
    for (const diagnostic of diagnostics) console.error(diagnostic);
    if (marker) console.log(marker);
    console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
  }

  if (!output.ok) process.exitCode = 1;
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function programSource(entityName: string, apiRoute: string, apiPort: number): string {
  return `using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using System.Text.Json;
using Gestor.Api.Common;
using Gestor.Api.DTO;
using Gestor.Api.Entities;
using Gestor.Api.Services;
using Gestor.Api.Validators;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://127.0.0.1:${apiPort}");
builder.Services.AddControllers();
builder.Services.AddSingleton<CrudRepository<${entityName}>>();
builder.Services.AddSingleton<${entityName}Validator>();
builder.Services.AddSingleton<${entityName}Service>();
var app = builder.Build();
app.MapControllers();
await app.StartAsync();

try
{
    using var client = new HttpClient { BaseAddress = new Uri("http://127.0.0.1:${apiPort}/") };
    var input = new ${entityName}Dto();
    Fill(input, 1);

    var post = await client.PostAsJsonAsync("${apiRoute}", input);
    Ensure(post.StatusCode == HttpStatusCode.Created, $"POST retornou {(int)post.StatusCode}");
    var created = await post.Content.ReadFromJsonAsync<${entityName}Dto>() ?? throw new InvalidOperationException("POST sem corpo");
    Ensure(created.Id > 0, "POST nao atribuiu Id");

    var get = await client.GetAsync("${apiRoute}/" + created.Id);
    Ensure(get.StatusCode == HttpStatusCode.OK, $"GET por id retornou {(int)get.StatusCode}");
    var loaded = await get.Content.ReadFromJsonAsync<${entityName}Dto>() ?? throw new InvalidOperationException("GET sem corpo");
    Ensure(loaded.Id == created.Id, "GET retornou Id divergente");

    Fill(loaded, 2);
    loaded.Id = created.Id;
    var put = await client.PutAsJsonAsync("${apiRoute}/" + created.Id, loaded);
    Ensure(put.StatusCode == HttpStatusCode.OK, $"PUT retornou {(int)put.StatusCode}");

    var list = await client.GetFromJsonAsync<List<${entityName}Dto>>("${apiRoute}") ?? throw new InvalidOperationException("GET lista sem corpo");
    Ensure(list.Count == 1, $"GET lista retornou {list.Count} item(ns)");

    var delete = await client.DeleteAsync("${apiRoute}/" + created.Id);
    Ensure(delete.StatusCode == HttpStatusCode.NoContent, $"DELETE retornou {(int)delete.StatusCode}");

    var missing = await client.GetAsync("${apiRoute}/" + created.Id);
    Ensure(missing.StatusCode == HttpStatusCode.NotFound, $"GET apos DELETE retornou {(int)missing.StatusCode}");
    Console.WriteLine("HTTP_RUNTIME_OK:${entityName}:route=${apiRoute}:crud=5");
}
catch (Exception ex)
{
    Console.Error.WriteLine("HTTP_RUNTIME_FAIL:" + ex);
    Environment.ExitCode = 1;
}
finally
{
    await app.StopAsync();
}

static void Fill(object target, int seed)
{
    foreach (var property in target.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance).Where(item => item.CanWrite && item.Name != "Id"))
    {
        var type = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
        object? value = type == typeof(string) ? $"valor-{seed}-{property.Name}" :
            type == typeof(int) ? seed * 10 :
            type == typeof(decimal) ? seed * 10.5m :
            type == typeof(bool) ? seed % 2 == 0 :
            type == typeof(DateTime) ? new DateTime(2026, 1, Math.Min(seed, 28), 0, 0, 0, DateTimeKind.Utc) : null;
        if (value is not null) property.SetValue(target, value);
    }
}

static void Ensure(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
}
`;
}

function commonStubs(): string {
  return `using Microsoft.AspNetCore.Mvc;
namespace Gestor.Api.Common;
public interface IEntity { int Id { get; set; } }
public interface IValidator<T> { IReadOnlyList<string> Validate(T input); }
public sealed class CrudRepository<T> where T : class, IEntity {
    private readonly List<T> items = new();
    public IReadOnlyList<T> GetAll() => items.ToArray();
    public T? GetById(int id) => items.FirstOrDefault(item => item.Id == id);
    public T Add(T item) { item.Id = items.Count == 0 ? 1 : items.Max(value => value.Id) + 1; items.Add(item); return item; }
    public bool Update(T item) { var index = items.FindIndex(value => value.Id == item.Id); if (index < 0) return false; items[index] = item; return true; }
    public bool Delete(int id) { var item = GetById(id); return item is not null && items.Remove(item); }
}
public abstract class CrudService<TEntity, TDto> where TEntity : class, IEntity {
    private readonly CrudRepository<TEntity> repository;
    private readonly IValidator<TDto> validator;
    protected CrudService(CrudRepository<TEntity> repository, IValidator<TDto> validator) { this.repository = repository; this.validator = validator; }
    protected abstract TDto ToDto(TEntity entity);
    protected abstract TEntity ToEntity(TDto input);
    public IReadOnlyList<TDto> GetAll() => repository.GetAll().Select(ToDto).ToArray();
    public TDto? GetById(int id) { var entity = repository.GetById(id); return entity is null ? default : ToDto(entity); }
    public (TDto? Value, IReadOnlyList<string> Errors) Create(TDto input) { var errors = validator.Validate(input); if (errors.Count > 0) return (default, errors); return (ToDto(repository.Add(ToEntity(input))), errors); }
    public (TDto? Value, IReadOnlyList<string> Errors, bool Found) Update(int id, TDto input) { var errors = validator.Validate(input); if (errors.Count > 0) return (default, errors, true); var entity = ToEntity(input); entity.Id = id; return repository.Update(entity) ? (ToDto(entity), errors, true) : (default, errors, false); }
    public bool Delete(int id) => repository.Delete(id);
}
public abstract class CrudControllerBase<TEntity, TDto, TService> : ControllerBase where TEntity : class, IEntity where TService : CrudService<TEntity, TDto> {
    private readonly TService service;
    protected CrudControllerBase(TService service) { this.service = service; }
    [HttpGet] public ActionResult<IReadOnlyList<TDto>> GetAll() => Ok(service.GetAll());
    [HttpGet("{id:int}")] public ActionResult<TDto> GetById(int id) { var value = service.GetById(id); return value is null ? NotFound() : Ok(value); }
    [HttpPost] public ActionResult<TDto> Create(TDto input) { var result = service.Create(input); return result.Errors.Count > 0 ? BadRequest(result.Errors) : CreatedAtAction(nameof(GetById), new { id = GetId(result.Value!) }, result.Value); }
    [HttpPut("{id:int}")] public ActionResult<TDto> Update(int id, TDto input) { var result = service.Update(id, input); if (result.Errors.Count > 0) return BadRequest(result.Errors); return result.Found ? Ok(result.Value) : NotFound(); }
    [HttpDelete("{id:int}")] public IActionResult Delete(int id) => service.Delete(id) ? NoContent() : NotFound();
    private static int GetId(TDto value) => (int)(typeof(TDto).GetProperty("Id")?.GetValue(value) ?? 0);
}
`;
}

function entityFrameworkStubs(): string {
  return `namespace Microsoft.EntityFrameworkCore;
public enum DeleteBehavior { Restrict }
public class DbSet<T> where T : class { }
namespace Microsoft.EntityFrameworkCore.Metadata.Builders;
public interface IEntityTypeConfiguration<T> where T : class { void Configure(EntityTypeBuilder<T> builder); }
public class EntityTypeBuilder<T> where T : class { public EntityTypeBuilder<T> ToTable(string name) => this; public KeyBuilder HasKey(System.Linq.Expressions.Expression<System.Func<T, object?>> expression) => new(); public PropertyBuilder Property<TProperty>(System.Linq.Expressions.Expression<System.Func<T, TProperty>> expression) => new(); public ReferenceNavigationBuilder<T, TRelated> HasOne<TRelated>(System.Linq.Expressions.Expression<System.Func<T, TRelated?>> expression) where TRelated : class => new(); }
public class KeyBuilder { }
public class PropertyBuilder { public PropertyBuilder HasColumnName(string name) => this; }
public class ReferenceNavigationBuilder<T, TRelated> where T : class where TRelated : class { public ReferenceCollectionBuilder<T, TRelated> WithMany() => new(); }
public class ReferenceCollectionBuilder<T, TRelated> where T : class where TRelated : class { public ReferenceCollectionBuilder<T, TRelated> HasForeignKey(System.Linq.Expressions.Expression<System.Func<T, object?>> expression) => this; public ReferenceCollectionBuilder<T, TRelated> HasPrincipalKey(System.Linq.Expressions.Expression<System.Func<TRelated, object?>> expression) => this; public ReferenceCollectionBuilder<T, TRelated> OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior behavior) => this; }
`;
}

function relatedEntityStubs(content: string, currentEntity: string): string {
  const names = new Set<string>();
  for (const match of content.matchAll(/public\s+([A-Z][A-Za-z0-9_]*)\?\s+[A-Z][A-Za-z0-9_]*\s*\{\s*get;/g)) {
    if (match[1] && match[1] !== currentEntity && !['String', 'DateTime', 'Decimal', 'Int32'].includes(match[1])) names.add(match[1]);
  }
  return `namespace Gestor.Api.Entities;\n${[...names].map((name) => `public class ${name} { public int Id { get; set; } }`).join('\n')}\n`;
}

async function findFreePort(): Promise<number> {
  return await new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') { server.close(); reject(new Error('porta dinamica indisponivel')); return; }
      const selected = address.port;
      server.close((error) => error ? reject(error) : resolvePort(selected));
    });
  });
}
