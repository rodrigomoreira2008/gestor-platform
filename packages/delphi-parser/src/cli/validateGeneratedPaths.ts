import { isAbsolute, normalize, posix } from 'node:path';
import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile {
  path: string;
  content: string;
}

interface PathIssue {
  scope: 'backend' | 'frontend';
  path: string;
  reason: string;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:paths arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const backend = generateBackendFiles(resolved);
const frontend = generateFrontendFiles(resolved);
const issues: PathIssue[] = [];

validateCollection('backend', backend, ['apps/backend/'], ['.cs', '.cs.txt', '.md'], issues);
validateCollection('frontend', frontend, ['apps/frontend/'], ['.ts', '.tsx', '.txt'], issues);

const allFiles = [...backend.map((file) => ({ ...file, scope: 'backend' as const })), ...frontend.map((file) => ({ ...file, scope: 'frontend' as const }))];
const caseInsensitive = new Map<string, { path: string; scope: 'backend' | 'frontend' }>();
for (const file of allFiles) {
  const key = normalizedPath(file.path).toLocaleLowerCase('en-US');
  const previous = caseInsensitive.get(key);
  if (previous) {
    issues.push({ scope: file.scope, path: file.path, reason: `colisao de caminho com ${previous.scope}:${previous.path}` });
  } else {
    caseInsensitive.set(key, { path: file.path, scope: file.scope });
  }
}

const output = {
  ok: issues.length === 0,
  backendFiles: backend.length,
  frontendFiles: frontend.length,
  totalFiles: allFiles.length,
  uniquePaths: caseInsensitive.size,
  issues
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log('Validacao de caminhos dos artefatos gerados');
  console.log(`Arquivos: ${output.totalFiles} (${output.backendFiles} backend, ${output.frontendFiles} frontend)`);
  for (const issue of issues) console.error(`[ERRO] ${issue.scope}:${issue.path} - ${issue.reason}`);
  console.log(output.ok ? 'Todos os caminhos gerados sao seguros e unicos.' : `${issues.length} problema(s) encontrado(s).`);
}

if (!output.ok) process.exit(1);

function validateCollection(
  scope: 'backend' | 'frontend',
  files: GeneratedFile[],
  allowedRoots: string[],
  allowedExtensions: string[],
  target: PathIssue[]
): void {
  const exactPaths = new Set<string>();
  for (const file of files) {
    const raw = file.path;
    const normalized = normalizedPath(raw);
    if (!raw.trim()) target.push({ scope, path: raw, reason: 'caminho vazio' });
    if (isAbsolute(raw) || /^[a-zA-Z]:[\\/]/.test(raw)) target.push({ scope, path: raw, reason: 'caminho absoluto nao permitido' });
    if (raw.includes('\\')) target.push({ scope, path: raw, reason: 'use separadores POSIX (/)' });
    if (raw.includes('\0')) target.push({ scope, path: raw, reason: 'caractere NUL nao permitido' });
    if (normalized.startsWith('../') || normalized === '..' || raw.split(/[\\/]+/).includes('..')) target.push({ scope, path: raw, reason: 'path traversal nao permitido' });
    if (normalized !== raw) target.push({ scope, path: raw, reason: `caminho nao normalizado; esperado ${normalized}` });
    if (!allowedRoots.some((root) => normalized.startsWith(root))) target.push({ scope, path: raw, reason: `fora da raiz permitida (${allowedRoots.join(', ')})` });
    if (!allowedExtensions.some((extension) => normalized.endsWith(extension))) target.push({ scope, path: raw, reason: `extensao nao permitida (${allowedExtensions.join(', ')})` });
    if (exactPaths.has(normalized)) target.push({ scope, path: raw, reason: 'caminho duplicado' });
    exactPaths.add(normalized);
    if (file.content.includes('\0')) target.push({ scope, path: raw, reason: 'conteudo contem caractere NUL' });
  }
}

function normalizedPath(value: string): string {
  return posix.normalize(normalize(value).replace(/\\/g, '/'));
}
