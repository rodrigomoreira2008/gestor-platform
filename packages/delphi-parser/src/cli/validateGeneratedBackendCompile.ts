import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { generateBackendFiles, resolveDelphiForm } from '../index';

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:backend-compile arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const dotnetVersion = spawnSync('dotnet', ['--version'], { encoding: 'utf8' });
if (dotnetVersion.error || dotnetVersion.status !== 0) {
  const output = {
    ok: false,
    entity,
    reason: 'dotnet SDK nao encontrado',
    detail: dotnetVersion.error?.message ?? dotnetVersion.stderr.trim()
  };
  console.log(json ? JSON.stringify(output, null, 2) : `ERRO: ${output.reason}. ${output.detail}`);
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const files = generateBackendFiles(resolved).filter((file) => file.path.endsWith('.cs'));
const tempRoot = mkdtempSync(join(tmpdir(), 'gestor-delphi-backend-'));

try {
  writeFileSync(join(tempRoot, 'GeneratedBackend.csproj'), `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>
</Project>
`);

  for (const file of files) {
    const target = join(tempRoot, basename(file.path));
    writeFileSync(target, file.content);
  }

  writeFileSync(join(tempRoot, 'CommonStubs.cs'), commonStubs());
  writeFileSync(join(tempRoot, 'EntityFrameworkStubs.cs'), entityFrameworkStubs());
  writeFileSync(join(tempRoot, 'RelatedEntityStubs.cs'), relatedEntityStubs(files.map((file) => file.content).join('\n'), entity));

  const build = spawnSync('dotnet', ['build', '--nologo', '--verbosity', 'minimal'], {
    cwd: tempRoot,
    encoding: 'utf8',
    env: { ...process.env, DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1' }
  });

  const combined = `${build.stdout ?? ''}\n${build.stderr ?? ''}`.trim();
  const diagnostics = combined
    .split(/\r?\n/)
    .filter((line) => /\berror\s+CS\d+|Build FAILED/i.test(line))
    .slice(0, 50);
  const output = {
    ok: build.status === 0,
    entity,
    sdk: dotnetVersion.stdout.trim(),
    generatedFiles: files.length,
    exitCode: build.status,
    diagnostics
  };

  if (json) console.log(JSON.stringify(output, null, 2));
  else {
    console.log(`Compilacao backend gerado de ${entity}`);
    console.log(`SDK .NET: ${output.sdk}`);
    console.log(`Arquivos C# verificados: ${files.length}`);
    for (const diagnostic of diagnostics) console.error(diagnostic);
    console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
  }

  if (!output.ok) process.exitCode = 1;
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
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
    where TEntity : class
    where TService : CrudService<TEntity, TDto> {
    protected CrudControllerBase(TService service) { }
}
`;
}

function entityFrameworkStubs(): string {
  return `namespace Microsoft.EntityFrameworkCore;
public enum DeleteBehavior { Restrict }
public class DbSet<T> where T : class { }
public static class ModelBuilderExtensions { }

namespace Microsoft.EntityFrameworkCore.Metadata.Builders;
public interface IEntityTypeConfiguration<T> where T : class { void Configure(EntityTypeBuilder<T> builder); }
public class EntityTypeBuilder<T> where T : class {
    public EntityTypeBuilder<T> ToTable(string name) => this;
    public KeyBuilder HasKey(System.Linq.Expressions.Expression<System.Func<T, object?>> keyExpression) => new();
    public PropertyBuilder Property<TProperty>(System.Linq.Expressions.Expression<System.Func<T, TProperty>> propertyExpression) => new();
    public ReferenceNavigationBuilder<T, TRelated> HasOne<TRelated>(System.Linq.Expressions.Expression<System.Func<T, TRelated?>> navigationExpression) where TRelated : class => new();
}
public class KeyBuilder { }
public class PropertyBuilder { public PropertyBuilder HasColumnName(string name) => this; }
public class ReferenceNavigationBuilder<T, TRelated> where T : class where TRelated : class {
    public ReferenceCollectionBuilder<T, TRelated> WithMany() => new();
}
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
  if (names.size === 0) return 'namespace Gestor.Api.Entities;\n';
  return `namespace Gestor.Api.Entities;\n${[...names].map((name) => `public class ${name} { public int Id { get; set; } }`).join('\n')}\n`;
}
