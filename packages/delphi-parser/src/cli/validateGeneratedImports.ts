import { posix } from 'node:path';
import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface ImportFailure {
  path: string;
  specifier: string;
  reason: 'missing-target' | 'self-import' | 'case-mismatch';
  candidates?: string[];
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:imports arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const files = generateFrontendFiles(resolved).filter((file) => /\.(?:ts|tsx)$/.test(file.path));
const exactPaths = new Set(files.map((file) => normalizePath(file.path)));
const lowerCasePaths = new Map(files.map((file) => [normalizePath(file.path).toLowerCase(), normalizePath(file.path)]));
const failures: ImportFailure[] = [];
let relativeImports = 0;
let externalImports = 0;
let integrationImports = 0;

for (const file of files) {
  const sourcePath = normalizePath(file.path);
  for (const specifier of extractImportSpecifiers(file.content)) {
    if (!specifier.startsWith('.')) {
      externalImports += 1;
      continue;
    }

    relativeImports += 1;
    const baseTarget = normalizePath(posix.resolve(posix.dirname(sourcePath), specifier));
    if (baseTarget.includes('/shared/')) {
      integrationImports += 1;
      continue;
    }

    const candidates = candidatePaths(baseTarget);
    const resolvedTarget = candidates.find((candidate) => exactPaths.has(candidate));
    if (resolvedTarget) {
      if (resolvedTarget === sourcePath) failures.push({ path: sourcePath, specifier, reason: 'self-import' });
      continue;
    }

    const caseInsensitiveTarget = candidates.map((candidate) => lowerCasePaths.get(candidate.toLowerCase())).find(Boolean);
    if (caseInsensitiveTarget) {
      failures.push({ path: sourcePath, specifier, reason: 'case-mismatch', candidates: [caseInsensitiveTarget] });
      continue;
    }

    failures.push({ path: sourcePath, specifier, reason: 'missing-target', candidates });
  }
}

const output = {
  ok: failures.length === 0,
  entity,
  checkedFiles: files.length,
  relativeImports,
  externalImports,
  integrationImports,
  failures
};

if (json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Validacao de imports dos artefatos frontend de ${entity}`);
  console.log(`Arquivos: ${files.length} | relativos: ${relativeImports} | externos: ${externalImports} | integracao: ${integrationImports}`);
  for (const failure of failures) {
    const candidates = failure.candidates?.length ? ` (esperado: ${failure.candidates.join(', ')})` : '';
    console.error(`[${failure.reason}] ${failure.path} -> ${failure.specifier}${candidates}`);
  }
  console.log(failures.length === 0 ? 'Resultado: OK' : `Resultado: ${failures.length} erro(s)`);
}

if (failures.length > 0) process.exit(1);

function extractImportSpecifiers(content: string): string[] {
  const specifiers: string[] = [];
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      if (match[1]) specifiers.push(match[1]);
    }
  }
  return specifiers;
}

function candidatePaths(baseTarget: string): string[] {
  if (/\.(?:ts|tsx)$/.test(baseTarget)) return [baseTarget];
  return [
    `${baseTarget}.ts`,
    `${baseTarget}.tsx`,
    `${baseTarget}/index.ts`,
    `${baseTarget}/index.tsx`
  ];
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/').replace(/\/\.\//g, '/');
}
