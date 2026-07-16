import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface FileMetric {
  path: string;
  lines: number;
  bytes: number;
  imports: number;
  functions: number;
  jsxElements: number;
  maxNesting: number;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-complexity arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const diagnostics: string[] = [];
const metrics: FileMetric[] = [];

const limits = {
  lines: 450,
  bytes: 40_000,
  imports: 24,
  functions: 24,
  jsxElements: 120,
  maxNesting: 18,
  totalBytes: 220_000
};

function inspect(file: GeneratedFile): FileMetric {
  const scriptKind = file.path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.ES2022, true, scriptKind);
  let imports = 0;
  let functions = 0;
  let jsxElements = 0;
  let maxNesting = 0;

  function visit(node: ts.Node, depth: number): void {
    if (ts.isImportDeclaration(node)) imports += 1;
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) functions += 1;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) jsxElements += 1;
    maxNesting = Math.max(maxNesting, depth);
    ts.forEachChild(node, (child) => visit(child, depth + 1));
  }

  visit(source, 0);
  return {
    path: file.path,
    lines: file.content.split(/\r?\n/).length,
    bytes: Buffer.byteLength(file.content, 'utf8'),
    imports,
    functions,
    jsxElements,
    maxNesting
  };
}

for (const file of generated.filter((item) => item.path.endsWith('.ts') || item.path.endsWith('.tsx'))) {
  const metric = inspect(file);
  metrics.push(metric);
  for (const key of ['lines', 'bytes', 'imports', 'functions', 'jsxElements', 'maxNesting'] as const) {
    if (metric[key] > limits[key]) diagnostics.push(`${file.path}: ${key}=${metric[key]} excede limite ${limits[key]}`);
  }
}

const totalBytes = metrics.reduce((sum, metric) => sum + metric.bytes, 0);
if (totalBytes > limits.totalBytes) diagnostics.push(`tamanho total ${totalBytes} excede limite ${limits.totalBytes}`);
const largest = [...metrics].sort((left, right) => right.bytes - left.bytes)[0] ?? null;
const runtimeMarker = diagnostics.length === 0
  ? `FRONTEND_COMPLEXITY_OK:${entity}:files=${metrics.length}:bytes=${totalBytes}:largest=${largest?.bytes ?? 0}`
  : null;

const report = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  inspectedFiles: metrics.length,
  totalBytes,
  largestFile: largest,
  limits,
  metrics,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(`- ${diagnostic}`);
}

if (diagnostics.length > 0) process.exit(1);
