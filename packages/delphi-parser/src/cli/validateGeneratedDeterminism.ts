import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile {
  path: string;
  content: string;
}

interface Difference {
  scope: 'resolved-form' | 'backend' | 'frontend';
  kind: 'content' | 'order' | 'input-mutation';
  detail: string;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:determinism arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const differences: Difference[] = [];

const firstResolved = resolveDelphiForm(dfm, pas, { entity, table });
const secondResolved = resolveDelphiForm(dfm, pas, { entity, table });
const firstResolvedJson = stableJson(firstResolved);
const secondResolvedJson = stableJson(secondResolved);

if (firstResolvedJson !== secondResolvedJson) {
  differences.push({ scope: 'resolved-form', kind: 'content', detail: 'Duas resolucoes do mesmo DFM/PAS produziram modelos diferentes.' });
}

const beforeGeneration = stableJson(firstResolved);
const firstBackend = generateBackendFiles(firstResolved);
const firstFrontend = generateFrontendFiles(firstResolved);
const afterGeneration = stableJson(firstResolved);

if (beforeGeneration !== afterGeneration) {
  differences.push({ scope: 'resolved-form', kind: 'input-mutation', detail: 'Os geradores alteraram o ResolvedForm recebido.' });
}

const secondBackend = generateBackendFiles(secondResolved);
const secondFrontend = generateFrontendFiles(secondResolved);
compareFiles('backend', firstBackend, secondBackend, differences);
compareFiles('frontend', firstFrontend, secondFrontend, differences);

const output = {
  ok: differences.length === 0,
  entity,
  resolvedHash: hash(firstResolvedJson),
  backendHash: hashFiles(firstBackend),
  frontendHash: hashFiles(firstFrontend),
  backendFiles: firstBackend.length,
  frontendFiles: firstFrontend.length,
  differences
};

if (json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Validacao de determinismo dos artefatos de ${entity}`);
  console.log(`ResolvedForm: ${output.resolvedHash}`);
  console.log(`Backend: ${output.backendFiles} arquivo(s), hash ${output.backendHash}`);
  console.log(`Frontend: ${output.frontendFiles} arquivo(s), hash ${output.frontendHash}`);
  for (const difference of differences) {
    console.error(`[${difference.scope}/${difference.kind}] ${difference.detail}`);
  }
  console.log(differences.length === 0 ? 'Resultado: deterministico' : `Resultado: ${differences.length} divergencia(s)`);
}

if (differences.length > 0) process.exit(1);

function compareFiles(scope: 'backend' | 'frontend', first: GeneratedFile[], second: GeneratedFile[], target: Difference[]): void {
  const firstPaths = first.map((file) => file.path);
  const secondPaths = second.map((file) => file.path);
  if (JSON.stringify(firstPaths) !== JSON.stringify(secondPaths)) {
    target.push({ scope, kind: 'order', detail: `A ordem ou o conjunto de paths mudou entre execucoes: ${firstPaths.join(', ')} <> ${secondPaths.join(', ')}` });
  }

  const secondByPath = new Map(second.map((file) => [file.path, file.content]));
  for (const file of first) {
    const repeatedContent = secondByPath.get(file.path);
    if (repeatedContent === undefined) {
      target.push({ scope, kind: 'content', detail: `Arquivo ausente na segunda execucao: ${file.path}` });
    } else if (file.content !== repeatedContent) {
      target.push({ scope, kind: 'content', detail: `Conteudo divergente em ${file.path}: ${hash(file.content)} <> ${hash(repeatedContent)}` });
    }
  }
}

function hashFiles(files: GeneratedFile[]): string {
  return hash(files.map((file) => `${file.path}\0${file.content}`).join('\0\0'));
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, sortValue(item)]));
  }
  return value;
}
