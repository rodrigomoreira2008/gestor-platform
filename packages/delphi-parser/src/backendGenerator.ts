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
