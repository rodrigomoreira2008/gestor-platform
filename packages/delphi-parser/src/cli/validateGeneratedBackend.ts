import { readFileSync } from 'node:fs';
import { generateBackendFiles, resolveDelphiForm } from '../index';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:backend arquivo.dfm arquivo.pas entidade [tabela]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const files = generateBackendFiles(resolved);
const requiredFragments = ['Entities/', 'DTO/', 'Validators/', 'Services/', 'Controllers/', 'Configurations/', 'Generated/'];
const missingFragments = requiredFragments.filter((fragment) => !files.some((file) => file.path.includes(fragment)));
const emptyFiles = files.filter((file) => file.content.trim().length === 0);
const duplicatePaths = files.map((file) => file.path).filter((path, index, paths) => paths.indexOf(path) !== index);
const invalidCSharp = files.filter((file) => file.path.endsWith('.cs') && (!file.content.includes('namespace ') || !file.content.includes('{') || !file.content.includes('}')));

if (missingFragments.length > 0 || emptyFiles.length > 0 || duplicatePaths.length > 0 || invalidCSharp.length > 0) {
  console.error(JSON.stringify({ missingFragments, emptyFiles: emptyFiles.map((file) => file.path), duplicatePaths, invalidCSharp: invalidCSharp.map((file) => file.path) }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ entity, generatedFiles: files.length, relationships: resolved.relationships.length, databaseQueries: resolved.databaseQueries.length }, null, 2));
