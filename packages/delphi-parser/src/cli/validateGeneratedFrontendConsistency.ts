import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-consistency arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const expectedFields = resolved.fields.map((field) => toCamelCase(field.name));
const diagnostics: string[] = [];
const sources: Record<string, string[]> = {};

const typesFile = generated.find((file) => file.path.endsWith(`/types/${entityCamel}.ts`));
const schemaFile = generated.find((file) => file.path.endsWith('/schema.ts'));
const filtersFile = generated.find((file) => file.path.endsWith(`/filters/${entityCamel}Filters.ts`));
const columnsFile = generated.find((file) => file.path.endsWith(`/table/${entityCamel}Columns.ts`));
const tabbedFormFile = generated.find((file) => file.path.endsWith(`/components/${entity}TabbedForm.tsx`));

for (const [label, file] of Object.entries({ types: typesFile, schema: schemaFile, filters: filtersFile, columns: columnsFile, tabbedForm: tabbedFormFile })) {
  if (!file) diagnostics.push(`arquivo obrigatorio ausente para consistencia: ${label}`);
}

if (typesFile) sources.types = extractInterfaceFields(typesFile.content, entity);
if (schemaFile) sources.schema = extractObjectKeys(schemaFile.content, `${entityCamel}Schema`);
if (filtersFile) sources.filters = extractNamedPropertyValues(filtersFile.content, 'name');
if (columnsFile) sources.columns = extractNamedPropertyValues(columnsFile.content, 'field').filter((field) => field !== 'id');
if (tabbedFormFile) sources.tabbedForm = extractFormReferences(tabbedFormFile.content, expectedFields);

for (const [source, fields] of Object.entries(sources)) {
  const unique = [...new Set(fields)];
  if (unique.length !== fields.length) diagnostics.push(`${source} possui campos duplicados`);
  const missing = expectedFields.filter((field) => !unique.includes(field));
  const unexpected = unique.filter((field) => !expectedFields.includes(field));
  if (missing.length > 0) diagnostics.push(`${source} nao referencia campos: ${missing.join(', ')}`);
  if (unexpected.length > 0) diagnostics.push(`${source} referencia campos inesperados: ${unexpected.join(', ')}`);
}

for (const field of expectedFields) {
  const presentIn = Object.entries(sources).filter(([, fields]) => fields.includes(field)).map(([source]) => source);
  if (presentIn.length !== Object.keys(sources).length) diagnostics.push(`campo ${field} nao esta consistente em todas as camadas`);
}

const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_CONSISTENCY_OK:${entity}:fields=${expectedFields.length}:sources=${Object.keys(sources).length}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  expectedFields,
  sources,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(diagnostic);
}

if (!ok) process.exit(1);

function extractInterfaceFields(content: string, interfaceName: string): string[] {
  const source = ts.createSourceFile('types.ts', content, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const declaration = source.statements.find(
    (statement): statement is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(statement) && statement.name.text === interfaceName
  );
  if (!declaration) return [];
  return declaration.members
    .filter(ts.isPropertySignature)
    .map((property) => property.name.getText(source).replace(/^['"]|['"]$/g, ''))
    .filter((name) => name !== 'id');
}

function extractObjectKeys(content: string, exportName: string): string[] {
  const pattern = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*z\\.object\\(\\{([\\s\\S]*?)\\}\\)`, 'm');
  const body = content.match(pattern)?.[1] ?? '';
  return [...body.matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gm)].map((match) => match[1]);
}

function extractNamedPropertyValues(content: string, property: string): string[] {
  const pattern = new RegExp(`${property}\\s*:\\s*['\"]([^'\"]+)['\"]`, 'g');
  return [...content.matchAll(pattern)].map((match) => match[1]);
}

function extractFormReferences(content: string, fields: string[]): string[] {
  return fields.filter((field) => new RegExp(`(?:form|errors)\\.${field}\\b|name=['\"]${field}['\"]`).test(content));
}

function toCamelCase(value: string): string {
  const pascal = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
