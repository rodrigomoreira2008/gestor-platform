import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface RecordedCall { method: string; args: unknown[]; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-api arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const apiFile = generated.find((file) => file.path.endsWith('/api/index.ts'));
const diagnostics: string[] = [];
const calls: RecordedCall[] = [];
let endpoint: string | null = null;
let exportNames: string[] = [];

if (!apiFile) {
  diagnostics.push('arquivo frontend api/index.ts nao foi gerado');
} else {
  try {
    const source = prepareForRuntime(apiFile.content);
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        esModuleInterop: true
      },
      fileName: apiFile.path,
      reportDiagnostics: true
    });

    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${apiFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const module = { exports: {} as Record<string, unknown> };
    const createCrudApi = (resourceEndpoint: string) => {
      endpoint = resourceEndpoint;
      return {
        getAll: (...methodArgs: unknown[]) => record('getAll', methodArgs),
        getById: (...methodArgs: unknown[]) => record('getById', methodArgs),
        create: (...methodArgs: unknown[]) => record('create', methodArgs),
        update: (...methodArgs: unknown[]) => record('update', methodArgs),
        remove: (...methodArgs: unknown[]) => record('remove', methodArgs)
      };
    };
    const context = vm.createContext({ module, exports: module.exports, createCrudApi, console });
    new vm.Script(transpiled.outputText, { filename: apiFile.path }).runInContext(context, { timeout: 1000 });

    const exported = module.exports;
    exportNames = Object.keys(exported).sort();
    const resourceApiName = exportNames.find((name) => name.endsWith('ResourceApi'));
    const expectedFunctions = ['getAll', 'getById', 'create', 'update', 'remove'];

    if (!endpoint?.startsWith('/api/')) diagnostics.push(`endpoint invalido: ${endpoint ?? 'nao definido'}`);
    if (!resourceApiName) diagnostics.push('export ResourceApi nao encontrado');

    const resourceApi = resourceApiName ? exported[resourceApiName] as Record<string, unknown> : undefined;
    for (const method of expectedFunctions) {
      if (typeof resourceApi?.[method] !== 'function') diagnostics.push(`ResourceApi sem metodo ${method}`);
    }

    const functionExports = Object.entries(exported).filter(([, value]) => typeof value === 'function');
    if (functionExports.length < 5) diagnostics.push(`quantidade insuficiente de funcoes exportadas: ${functionExports.length}`);

    for (const [name, value] of functionExports) {
      const fn = value as (...fnArgs: unknown[]) => unknown;
      if (/^get.+s$/.test(name)) fn();
      else if (/^get/.test(name) || /^remove/.test(name)) fn(7);
      else if (/^create/.test(name)) fn({ nome: 'Teste' });
      else if (/^update/.test(name)) fn(7, { nome: 'Atualizado' });
    }

    const calledMethods = new Set(calls.map((call) => call.method));
    for (const method of expectedFunctions) {
      if (!calledMethods.has(method)) diagnostics.push(`metodo ${method} nao foi exercitado pelos exports`);
    }
  } catch (error) {
    diagnostics.push(`${apiFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const runtimeMarker = diagnostics.length === 0
  ? `FRONTEND_API_OK:${entity}:endpoint=${endpoint}:calls=${calls.length}`
  : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  endpoint,
  generatedFiles: generated.length,
  apiFile: apiFile?.path ?? null,
  exports: exportNames,
  calls,
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao da API frontend gerada de ${entity}`);
  console.log(`Endpoint: ${endpoint ?? 'nao resolvido'}`);
  console.log(`Exports: ${exportNames.join(', ') || 'nenhum'}`);
  for (const call of calls) console.log(`[OK] ${call.method}(${call.args.length} argumento(s))`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);

function record(method: string, methodArgs: unknown[]): Record<string, unknown> {
  calls.push({ method, args: methodArgs });
  return { method, args: methodArgs };
}

function prepareForRuntime(content: string): string {
  return content
    .replace(/^import\s+\{\s*createCrudApi\s*\}[^\n]*\n/m, '')
    .replace(/^import\s+type[^\n]*\n/gm, '')
    .replace(/createCrudApi<[^>]+>/g, 'createCrudApi');
}
