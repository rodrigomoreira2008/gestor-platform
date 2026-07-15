import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface ModuleResult { file: string; exports: string[]; arrays: Record<string, number>; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-runtime arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const runtimeCandidates = generated.filter((file) =>
  file.path.endsWith('.ts') &&
  !file.path.endsWith('/api/index.ts') &&
  !file.path.endsWith('/hooks/index.ts') &&
  !file.path.includes('LookupHooks') &&
  !file.path.includes('DetailHooks') &&
  !file.path.includes('/schema/') &&
  !file.path.includes('/table/') &&
  !/^\s*import\s/m.test(file.content)
);

const results: ModuleResult[] = [];
const diagnostics: string[] = [];

for (const file of runtimeCandidates) {
  try {
    const transpiled = ts.transpileModule(file.content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        esModuleInterop: true
      },
      fileName: file.path,
      reportDiagnostics: true
    });

    for (const diagnostic of transpiled.diagnostics ?? []) {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      diagnostics.push(`${file.path}: TS${diagnostic.code} ${message}`);
    }

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, console });
    const script = new vm.Script(transpiled.outputText, { filename: file.path });
    script.runInContext(context, { timeout: 1000 });

    const exported = module.exports;
    const exportNames = Object.keys(exported).sort();
    if (exportNames.length === 0) throw new Error('modulo sem exports em runtime');

    const arrays: Record<string, number> = {};
    for (const [name, value] of Object.entries(exported)) {
      if (value === undefined) throw new Error(`export ${name} resultou em undefined`);
      if (Array.isArray(value)) {
        if (value.some((item) => item === undefined)) throw new Error(`array ${name} contem item undefined`);
        JSON.stringify(value);
        arrays[name] = value.length;
      }
    }

    results.push({ file: file.path, exports: exportNames, arrays });
  } catch (error) {
    diagnostics.push(`${file.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (runtimeCandidates.length === 0) diagnostics.push('nenhum modulo frontend puro elegivel para execucao');
const runtimeMarker = diagnostics.length === 0 ? `FRONTEND_RUNTIME_OK:${entity}:modules=${results.length}:exports=${results.reduce((total, item) => total + item.exports.length, 0)}` : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  executedModules: results.length,
  runtimeMarker,
  modules: results,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Smoke test frontend gerado de ${entity}`);
  console.log(`Arquivos frontend gerados: ${generated.length}`);
  console.log(`Modulos puros executados: ${results.length}`);
  for (const result of results) console.log(`[OK] ${result.file}: ${result.exports.join(', ')}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
