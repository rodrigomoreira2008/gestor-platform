import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-navigation arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = toPascalCase(entity);
const plural = toKebabPlural(toCamelCase(entity));
const routeFile = generated.find((file) => file.path.endsWith(`/Generated/${entityPascal}Route.tsx.txt`));
const menuFile = generated.find((file) => file.path.endsWith(`/Generated/${entityPascal}MenuItem.ts.txt`));
const diagnostics: string[] = [];

if (!routeFile) diagnostics.push(`snippet ${entityPascal}Route.tsx.txt nao foi gerado`);
if (!menuFile) diagnostics.push(`snippet ${entityPascal}MenuItem.ts.txt nao foi gerado`);

if (routeFile) {
  const content = routeFile.content;
  const expectedImport = `import { ${entityPascal}Page } from '../modules/${plural}/pages/${entityPascal}Page';`;
  const expectedRoute = `{ path: '/${plural}', element: <${entityPascal}Page /> }`;
  if (!content.includes('Adicionar ao arquivo de rotas')) diagnostics.push('snippet de rota sem instrucao de integracao');
  if (!content.includes(expectedImport)) diagnostics.push(`import de rota incorreto; esperado: ${expectedImport}`);
  if (!content.includes(expectedRoute)) diagnostics.push(`declaracao de rota incorreta; esperado: ${expectedRoute}`);
  if ((content.match(new RegExp(`/${escapeRegExp(plural)}`, 'g')) ?? []).length < 2) diagnostics.push('caminho da rota nao aparece no import e na declaracao esperada');
  if (/\bundefined\b|\bnull\b|TODO|FIXME/.test(content)) diagnostics.push('snippet de rota contem placeholder invalido');
}

if (menuFile) {
  const content = menuFile.content;
  const expectedMenu = `{ label: '${entityPascal}', path: '/${plural}' }`;
  if (!content.includes('Adicionar ao menu')) diagnostics.push('snippet de menu sem instrucao de integracao');
  if (!content.includes(expectedMenu)) diagnostics.push(`item de menu incorreto; esperado: ${expectedMenu}`);
  if (/\bundefined\b|\bnull\b|TODO|FIXME/.test(content)) diagnostics.push('snippet de menu contem placeholder invalido');
}

if (routeFile && menuFile) {
  const routePath = extractPath(routeFile.content);
  const menuPath = extractPath(menuFile.content);
  if (!routePath || !menuPath) diagnostics.push('nao foi possivel extrair os caminhos dos snippets');
  else if (routePath !== menuPath) diagnostics.push(`rota (${routePath}) e menu (${menuPath}) usam caminhos diferentes`);
  if (routePath !== `/${plural}`) diagnostics.push(`caminho gerado ${routePath ?? '<ausente>'} difere de /${plural}`);
}

const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_NAVIGATION_OK:${entityPascal}:path=/${plural}:snippets=2` : null;
const report = {
  ok,
  entity: entityPascal,
  generatedFiles: generated.length,
  routeFile: routeFile?.path ?? null,
  menuFile: menuFile?.path ?? null,
  routePath: routeFile ? extractPath(routeFile.content) : null,
  menuPath: menuFile ? extractPath(menuFile.content) : null,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(`- ${diagnostic}`);
}

if (!ok) process.exit(1);

function extractPath(content: string): string | null {
  return content.match(/path:\s*['"]([^'"]+)['"]/)?.[1] ?? null;
}

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
