import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:generated arquivo.dfm arquivo.pas entidade [tabela]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const backendFiles = generateBackendFiles(resolved);
const frontendFiles = generateFrontendFiles(resolved);
const allFiles = [...backendFiles, ...frontendFiles];
const duplicatePaths = allFiles.map((file) => file.path).filter((path, index, paths) => paths.indexOf(path) !== index);
const emptyFiles = allFiles.filter((file) => file.content.trim().length === 0);
const warnings = [
  ...resolved.lookups.filter((lookup) => lookup.confidence !== 'high').map((lookup) => `lookup:${lookup.fieldName}:${lookup.confidence}`),
  ...resolved.tabs.filter((tab) => tab.confidence !== 'high').map((tab) => `tab:${tab.name}:${tab.confidence}`),
  ...resolved.detailGrids.filter((grid) => grid.confidence !== 'high').map((grid) => `detailGrid:${grid.name}:${grid.confidence}`)
];
const issues = {
  duplicatePaths,
  emptyFiles: emptyFiles.map((file) => file.path),
  missingFields: resolved.fields.length === 0,
  missingBackendFiles: backendFiles.length === 0,
  missingFrontendFiles: frontendFiles.length === 0
};

if (issues.duplicatePaths.length > 0 || issues.emptyFiles.length > 0 || issues.missingFields || issues.missingBackendFiles || issues.missingFrontendFiles) {
  console.error(JSON.stringify({ ...issues, warnings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  entity,
  backendFiles: backendFiles.length,
  frontendFiles: frontendFiles.length,
  totalFiles: allFiles.length,
  fields: resolved.fields.length,
  actions: resolved.actions.length,
  lookups: resolved.lookups.length,
  tabs: resolved.tabs.length,
  detailGrids: resolved.detailGrids.length,
  warnings
}, null, 2));
