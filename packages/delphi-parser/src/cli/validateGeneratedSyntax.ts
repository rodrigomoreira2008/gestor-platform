import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface SyntaxFailure {
  path: string;
  line?: number;
  column?: number;
  code: number;
  message: string;
}

const [dfmPath, pasPath, entity, table] = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:syntax arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const files = generateFrontendFiles(resolved).filter((file) => /\.tsx?$/.test(file.path));
const failures: SyntaxFailure[] = [];

for (const file of files) {
  const result = ts.transpileModule(file.content, {
    fileName: file.path,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: file.path.endsWith('.tsx') ? ts.JsxEmit.ReactJSX : ts.JsxEmit.None,
      isolatedModules: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true
    }
  });

  for (const diagnostic of result.diagnostics ?? []) {
    if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
    const position = diagnostic.file && diagnostic.start !== undefined
      ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
      : undefined;
    failures.push({
      path: file.path,
      line: position ? position.line + 1 : undefined,
      column: position ? position.character + 1 : undefined,
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    });
  }
}

const output = {
  ok: failures.length === 0,
  entity,
  checkedFiles: files.length,
  failures
};

if (json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Validacao sintatica dos artefatos frontend de ${entity}`);
  console.log(`Arquivos TypeScript/TSX verificados: ${files.length}`);
  for (const failure of failures) {
    const location = failure.line ? `:${failure.line}:${failure.column ?? 1}` : '';
    console.error(`[TS${failure.code}] ${failure.path}${location} - ${failure.message}`);
  }
  console.log(failures.length === 0 ? 'Resultado: OK' : `Resultado: ${failures.length} erro(s)`);
}

if (failures.length > 0) process.exit(1);
