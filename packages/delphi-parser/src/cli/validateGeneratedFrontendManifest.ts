import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile {
  path: string;
  content: string;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-manifest arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const diagnostics: string[] = [];
const entityCamel = toCamelCase(entity);
const entityPascal = toPascalCase(entity);
const plural = toKebabPlural(entityCamel);
const root = `apps/frontend/src/modules/${plural}`;
const paths = generated.map((file) => file.path);
const uniquePaths = new Set(paths);

const requiredPaths = [
  `${root}/types/${entityCamel}.ts`,
  `${root}/api/index.ts`,
  `${root}/hooks/index.ts`,
  `${root}/schema/${entityCamel}Schema.ts`,
  `${root}/filters/${entityCamel}Filters.ts`,
  `${root}/components/${entityPascal}Filters.tsx`,
  `${root}/lookups/${entityCamel}Lookups.ts`,
  `${root}/lookups/${entityCamel}LookupHooks.ts`,
  `${root}/components/${entityPascal}LookupField.tsx`,
  `${root}/details/${entityCamel}DetailGrids.ts`,
  `${root}/details/${entityCamel}DetailHooks.ts`,
  `${root}/tabs/${entityCamel}Tabs.ts`,
  `${root}/components/${entityPascal}Form.tsx`,
  `${root}/components/${entityPascal}TabbedForm.tsx`,
  `${root}/table/${entityCamel}Columns.ts`,
  `${root}/pages/${entityPascal}Page.tsx`,
  `${root}/Generated/${entityPascal}Route.tsx.txt`,
  `${root}/Generated/${entityPascal}MenuItem.ts.txt`
];

if (generated.length !== 18 + resolved.detailGrids.length) {
  diagnostics.push(`manifesto possui ${generated.length} arquivos; esperado ${18 + resolved.detailGrids.length}`);
}
if (uniquePaths.size !== paths.length) diagnostics.push('manifesto possui caminhos duplicados');

for (const requiredPath of requiredPaths) {
  if (!uniquePaths.has(requiredPath)) diagnostics.push(`arquivo obrigatorio ausente: ${requiredPath}`);
}

for (const file of generated) {
  if (!file.path.startsWith(`${root}/`)) diagnostics.push(`arquivo fora da raiz do modulo: ${file.path}`);
  if (file.path.includes('\\')) diagnostics.push(`caminho usa separador Windows: ${file.path}`);
  if (file.path.split('/').includes('..')) diagnostics.push(`caminho contem travessia de diretorio: ${file.path}`);
  if (!/\.(?:ts|tsx|txt)$/.test(file.path)) diagnostics.push(`extensao inesperada: ${file.path}`);
  if (!file.content.trim()) diagnostics.push(`arquivo vazio: ${file.path}`);
  if (/\u0000/.test(file.content)) diagnostics.push(`arquivo contem byte nulo: ${file.path}`);
}

const detailComponentPaths = generated
  .filter((file) => file.path.startsWith(`${root}/details/`) && file.path.endsWith('DetailGrid.tsx'))
  .map((file) => file.path);

if (detailComponentPaths.length !== resolved.detailGrids.length) {
  diagnostics.push(`foram gerados ${detailComponentPaths.length} componentes para ${resolved.detailGrids.length} grids de detalhe`);
}

for (const grid of resolved.detailGrids) {
  const expected = `${root}/details/${entityPascal}${toPascalCase(grid.name)}DetailGrid.tsx`;
  if (!uniquePaths.has(expected)) diagnostics.push(`componente de detalhe ausente: ${expected}`);
}

const directories = Array.from(new Set(paths.map((path) => path.slice(0, path.lastIndexOf('/'))))).sort();
const runtimeMarker = diagnostics.length === 0
  ? `FRONTEND_MANIFEST_OK:${entity}:files=${generated.length}:directories=${directories.length}`
  : null;

const report = {
  ok: diagnostics.length === 0,
  entity,
  root,
  generatedFiles: generated.length,
  expectedFiles: 18 + resolved.detailGrids.length,
  uniqueFiles: uniquePaths.size,
  directories,
  detailComponents: detailComponentPaths.length,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(`- ${diagnostic}`);
}

if (diagnostics.length > 0) process.exit(1);

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabPlural(value: string): string {
  const kebab = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}
