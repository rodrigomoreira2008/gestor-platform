import { dirname, extname, normalize, posix, resolve as resolvePath } from 'node:path';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface ImportReference { importer: string; specifier: string; resolved: string | null; external: boolean; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-wiring arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolvedForm = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolvedForm) as GeneratedFile[];
const diagnostics: string[] = [];
const references: ImportReference[] = [];
const generatedPaths = new Set(generated.map((file) => normalizeSlashes(file.path)));
const allowedExternal = new Set([
  'react',
  'react/jsx-runtime',
  '@mui/material',
  '@mui/icons-material',
  '@mui/x-data-grid',
  '@tanstack/react-query',
  'zod'
]);

function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, '/');
}

function candidatePaths(importer: string, specifier: string): string[] {
  const base = normalizeSlashes(posix.normalize(posix.join(posix.dirname(normalizeSlashes(importer)), specifier)));
  if (extname(base)) return [base];
  return [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.txt`,
    `${base}/index.ts`,
    `${base}/index.tsx`
  ];
}

function collectImports(file: GeneratedFile): string[] {
  if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx')) return [];
  const source = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.ES2022, true, file.path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports: string[] = [];
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) imports.push(statement.moduleSpecifier.text);
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) imports.push(statement.moduleSpecifier.text);
  }
  return imports;
}

for (const file of generated) {
  for (const specifier of collectImports(file)) {
    if (!specifier.startsWith('.')) {
      const external = allowedExternal.has(specifier) || specifier.startsWith('../../../shared/');
      references.push({ importer: file.path, specifier, resolved: null, external });
      if (!external) diagnostics.push(`${file.path}: dependencia externa nao permitida: ${specifier}`);
      continue;
    }

    const candidates = candidatePaths(file.path, specifier);
    const target = candidates.find((candidate) => generatedPaths.has(candidate));
    references.push({ importer: file.path, specifier, resolved: target ?? null, external: false });
    if (!target) diagnostics.push(`${file.path}: import relativo sem destino gerado: ${specifier}`);
  }
}

const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const pluralRoot = generated[0]?.path.split('/types/')[0] ?? '';
const requiredEdges: Array<[string, string]> = [
  [`${pluralRoot}/api/index.ts`, `../types/${entityCamel}`],
  [`${pluralRoot}/hooks/index.ts`, '../api'],
  [`${pluralRoot}/hooks/index.ts`, `../types/${entityCamel}`],
  [`${pluralRoot}/pages/${entity}Page.tsx`, '../hooks'],
  [`${pluralRoot}/pages/${entity}Page.tsx`, `../table/${entityCamel}Columns`],
  [`${pluralRoot}/pages/${entity}Page.tsx`, `../types/${entityCamel}`],
  [`${pluralRoot}/components/${entity}TabbedForm.tsx`, `../schema/${entityCamel}Schema`],
  [`${pluralRoot}/components/${entity}LookupField.tsx`, `../lookups/${entityCamel}LookupHooks`]
];

for (const [importer, specifier] of requiredEdges) {
  const importerFile = generated.find((file) => normalizeSlashes(file.path) === normalizeSlashes(importer));
  if (!importerFile) {
    diagnostics.push(`arquivo obrigatorio ausente para ligacao: ${importer}`);
    continue;
  }
  if (!collectImports(importerFile).includes(specifier)) diagnostics.push(`${importer}: ligacao obrigatoria ausente: ${specifier}`);
}

for (const reference of references) {
  if (reference.resolved && normalizeSlashes(reference.resolved) === normalizeSlashes(reference.importer)) {
    diagnostics.push(`${reference.importer}: autoimport detectado por ${reference.specifier}`);
  }
}

const relativeReferences = references.filter((reference) => reference.specifier.startsWith('.'));
const resolvedReferences = relativeReferences.filter((reference) => reference.resolved);
const marker = `FRONTEND_WIRING_OK:${entity}:imports=${references.length}:resolved=${resolvedReferences.length}`;
const report = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  imports: references.length,
  relativeImports: relativeReferences.length,
  resolvedImports: resolvedReferences.length,
  externalImports: references.filter((reference) => !reference.specifier.startsWith('.')).length,
  requiredEdges: requiredEdges.length,
  runtimeMarker: diagnostics.length === 0 ? marker : null,
  references,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else if (diagnostics.length === 0) console.log(marker);
else diagnostics.forEach((diagnostic) => console.error(diagnostic));

if (diagnostics.length > 0) process.exit(1);
