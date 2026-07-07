import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend arquivo.dfm arquivo.pas entidade [tabela]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const files = generateFrontendFiles(resolved);
const requiredFragments = ['types/', 'api/', 'hooks/', 'schema/', 'filters/', 'lookups/', 'components/', 'table/', 'pages/'];
const missingFragments = requiredFragments.filter((fragment) => !files.some((file) => file.path.includes(fragment)));
const emptyFiles = files.filter((file) => file.content.trim().length === 0);
const duplicatePaths = files.map((file) => file.path).filter((path, index, paths) => paths.indexOf(path) !== index);

if (missingFragments.length > 0 || emptyFiles.length > 0 || duplicatePaths.length > 0) {
  console.error(JSON.stringify({ missingFragments, emptyFiles: emptyFiles.map((file) => file.path), duplicatePaths }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ entity, generatedFiles: files.length, detailGrids: resolved.detailGrids.length, lookups: resolved.lookups.length, tabs: resolved.tabs.length }, null, 2));
