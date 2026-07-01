import type { ResolvedField, ResolvedForm } from './resolvedForm';

export interface FrontendGeneratedFile {
  path: string;
  content: string;
}

export interface FrontendGeneratorOptions {
  outputRoot?: string;
}

export function generateFrontendFiles(resolved: ResolvedForm, options: FrontendGeneratorOptions = {}): FrontendGeneratedFile[] {
  const entity = toCamelCase(resolved.form.entity);
  const entityPascal = toPascalCase(resolved.form.entity);
  const plural = toKebabPlural(entity);
  const outputRoot = options.outputRoot ?? `apps/frontend/src/modules/${plural}`;

  return [
    {
      path: `${outputRoot}/types/${entity}.ts`,
      content: generateTypes(entityPascal, resolved.fields)
    },
    {
      path: `${outputRoot}/api/index.ts`,
      content: generateApi(entityPascal, entity, plural)
    },
    {
      path: `${outputRoot}/hooks/index.ts`,
      content: generateHooks(entityPascal, entity, plural)
    },
    {
      path: `${outputRoot}/pages/${entityPascal}Page.tsx`,
      content: generatePage(entityPascal, plural, resolved.fields)
    }
  ];
}

function generateTypes(entityPascal: string, fields: ResolvedField[]): string {
  const properties = fields.map((field) => `  ${toCamelCase(field.name)}?: ${mapTsType(field)};`).join('\n');
  return `export interface ${entityPascal} {
  id: number;
${properties}
}

export type ${entityPascal}Input = Omit<${entityPascal}, 'id'>;
`;
}

function generateApi(entityPascal: string, entity: string, plural: string): string {
  return `import { createCrudApi } from '../../../shared/crud/crudApiFactory';
import type { ${entityPascal}, ${entityPascal}Input } from '../types/${entity}';

const api = createCrudApi<${entityPascal}, ${entityPascal}Input>('/api/${plural}');

export const get${entityPascal}s = api.getAll;
export const get${entityPascal} = api.getById;
export const create${entityPascal} = api.create;
export const update${entityPascal} = api.update;
export const remove${entityPascal} = api.remove;
export const ${entity}ResourceApi = api;
`;
}

function generateHooks(entityPascal: string, entity: string, plural: string): string {
  return `import { useCrudResource } from '../../../shared/crud/useCrudResource';
import { ${entity}ResourceApi } from '../api';
import type { ${entityPascal}, ${entityPascal}Input } from '../types/${entity}';

function use${entityPascal}Resource() {
  return useCrudResource<${entityPascal}, ${entityPascal}Input>('${plural}', ${entity}ResourceApi);
}

export function use${entityPascal}s() {
  return use${entityPascal}Resource().list;
}

export function useCreate${entityPascal}() {
  return use${entityPascal}Resource().create;
}

export function useUpdate${entityPascal}() {
  return use${entityPascal}Resource().update;
}

export function useRemove${entityPascal}() {
  return use${entityPascal}Resource().remove;
}
`;
}

function generatePage(entityPascal: string, plural: string, fields: ResolvedField[]): string {
  const displayField = fields.find((field) => field.label)?.name ?? fields[0]?.name ?? 'id';
  return `import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { use${entityPascal}s } from '../hooks';

export function ${entityPascal}Page() {
  const list = use${entityPascal}s();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>${entityPascal}</Typography>
      {list.isLoading && <CircularProgress size={24} />}
      {list.isError && <Alert severity="warning">Não foi possível carregar ${plural}.</Alert>}
      {list.data?.map((item) => (
        <Box key={item.id} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          {item.${toCamelCase(displayField)} ?? item.id}
        </Box>
      ))}
    </Box>
  );
}
`;
}

function mapTsType(field: ResolvedField): string {
  const normalized = field.name.toLowerCase();
  if (normalized.includes('valor') || normalized.includes('preco') || normalized.includes('total')) return 'number';
  if (normalized.includes('quantidade') || normalized.includes('qtd')) return 'number';
  if (normalized === 'id' || normalized.endsWith('id') || normalized.includes('codigo')) return 'number';
  if (normalized.includes('data')) return 'string';
  return 'string';
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

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
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
