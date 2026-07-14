import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface CompileFailure {
  path: string;
  line?: number;
  column?: number;
  code: number;
  message: string;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-compile arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const root = mkdtempSync(join(tmpdir(), 'gestor-frontend-compile-'));
const failures: CompileFailure[] = [];

try {
  const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
  const generated = generateFrontendFiles(resolved).filter((file) => /\.tsx?$/.test(file.path));
  const roots: string[] = [];

  for (const file of generated) {
    const normalized = file.path.replace(/^apps\/frontend\/?/, 'src/');
    const target = join(root, normalized);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content, 'utf8');
    roots.push(target);
  }

  const ambientPath = join(root, 'src/generated-ambient.d.ts');
  mkdirSync(dirname(ambientPath), { recursive: true });
  writeFileSync(ambientPath, `
declare module '*' {
  const value: any;
  export = value;
}
declare namespace JSX {
  interface IntrinsicElements { [name: string]: any }
}
`, 'utf8');
  roots.push(ambientPath);

  const program = ts.createProgram(roots, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    noEmit: true,
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    allowImportingTsExtensions: true
  });

  const ignoredCodes = new Set([2307, 7016]);
  for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
    if (ignoredCodes.has(diagnostic.code)) continue;
    const position = diagnostic.file && diagnostic.start !== undefined
      ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
      : undefined;
    failures.push({
      path: diagnostic.file ? relative(root, diagnostic.file.fileName).replace(/\\/g, '/') : '<compiler>',
      line: position ? position.line + 1 : undefined,
      column: position ? position.character + 1 : undefined,
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    });
  }

  const output = { ok: failures.length === 0, entity, checkedFiles: generated.length, failures };
  if (json) console.log(JSON.stringify(output, null, 2));
  else {
    console.log(`Compilacao TypeScript dos artefatos frontend de ${entity}`);
    console.log(`Arquivos verificados: ${generated.length}`);
    for (const failure of failures) {
      const location = failure.line ? `:${failure.line}:${failure.column ?? 1}` : '';
      console.error(`[TS${failure.code}] ${failure.path}${location} - ${failure.message}`);
    }
    console.log(failures.length === 0 ? 'Resultado: OK' : `Resultado: ${failures.length} erro(s)`);
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}

if (failures.length > 0) process.exit(1);
