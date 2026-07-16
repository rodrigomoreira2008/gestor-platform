import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface QueryOptions {
  queryKey?: unknown[];
  queryFn?: (context: { signal: AbortSignal }) => Promise<unknown>;
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-lookup-hooks arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const definitionsFile = generated.find((file) => file.path.endsWith(`/lookups/${entityCamel}Lookups.ts`));
const hooksFile = generated.find((file) => file.path.endsWith(`/lookups/${entityCamel}LookupHooks.ts`));
const diagnostics: string[] = [];
const queryCalls: QueryOptions[] = [];
const fetchCalls: Array<{ url: string; signalMatches: boolean }> = [];
let exportsFound: string[] = [];
let definitionsCount = 0;
let hookCount = 0;
let enabledTrue = 0;
let enabledFalse = 0;
let normalizedOptions = 0;

function transpile(file: GeneratedFile): string {
  const result = ts.transpileModule(file.content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      esModuleInterop: true
    },
    fileName: file.path,
    reportDiagnostics: true
  });
  for (const diagnostic of result.diagnostics ?? []) {
    diagnostics.push(`${file.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
  }
  return result.outputText;
}

function executeCommonJs(code: string, filename: string, require: (specifier: string) => unknown, extra: Record<string, unknown> = {}): Record<string, unknown> {
  const module = { exports: {} as Record<string, unknown> };
  const context = vm.createContext({ module, exports: module.exports, require, console, ...extra });
  new vm.Script(code, { filename }).runInContext(context, { timeout: 1000 });
  return module.exports;
}

if (!definitionsFile) diagnostics.push(`arquivo lookups/${entityCamel}Lookups.ts nao foi gerado`);
if (!hooksFile) diagnostics.push(`arquivo lookups/${entityCamel}LookupHooks.ts nao foi gerado`);

if (definitionsFile && hooksFile) {
  try {
    const definitionsExports = executeCommonJs(transpile(definitionsFile), definitionsFile.path, (specifier) => {
      throw new Error(`modulo nao permitido nas definicoes: ${specifier}`);
    });
    const definitions = definitionsExports[`${entityCamel}Lookups`];
    if (!Array.isArray(definitions)) {
      diagnostics.push(`export ${entityCamel}Lookups ausente ou nao e array`);
    } else {
      definitionsCount = definitions.length;
      if (definitionsCount !== resolved.lookups.length) diagnostics.push(`foram geradas ${definitionsCount} definicoes para ${resolved.lookups.length} lookups inferidos`);
    }

    const useQuery = (options: QueryOptions) => {
      queryCalls.push(options);
      if (options.enabled) enabledTrue += 1;
      else enabledFalse += 1;
      return { data: undefined, ...options };
    };

    const expectedSignal = new AbortController().signal;
    const fetch = async (url: string, init?: { signal?: AbortSignal }) => {
      fetchCalls.push({ url, signalMatches: init?.signal === expectedSignal });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            { id: 2, descricao: 'Zulu' },
            { id: 1, descricao: 'Alpha' },
            { id: null, descricao: 'Ignorado' }
          ]
        })
      };
    };

    const hooksExports = executeCommonJs(transpile(hooksFile), hooksFile.path, (specifier) => {
      if (specifier === '@tanstack/react-query') return { useQuery };
      if (specifier === `../lookups/${entityCamel}Lookups`) return definitionsExports;
      throw new Error(`modulo nao permitido nos hooks: ${specifier}`);
    }, { fetch, AbortController });

    exportsFound = Object.keys(hooksExports).sort();
    const hookRegistry = hooksExports[`${entityCamel}LookupHooks`];
    if (!hookRegistry || typeof hookRegistry !== 'object') diagnostics.push(`export ${entityCamel}LookupHooks ausente ou invalido`);

    for (const lookup of resolved.lookups) {
      const hookName = `use${toPascalCase(lookup.fieldName)}Lookup`;
      const hook = hooksExports[hookName];
      if (typeof hook !== 'function') {
        diagnostics.push(`export ${hookName} ausente ou nao executavel`);
        continue;
      }
      hookCount += 1;
      (hook as (enabled?: boolean) => unknown)(false);
      (hook as (enabled?: boolean) => unknown)(true);
    }

    if (queryCalls.length !== hookCount * 2) diagnostics.push(`useQuery chamado ${queryCalls.length} vez(es), esperado ${hookCount * 2}`);
    for (let index = 0; index < queryCalls.length; index += 1) {
      const call = queryCalls[index];
      if (!Array.isArray(call.queryKey) || call.queryKey[0] !== 'lookup') diagnostics.push(`queryKey invalida na chamada ${index + 1}`);
      if (call.staleTime !== 300_000) diagnostics.push(`staleTime invalido na chamada ${index + 1}`);
      if (call.retry !== 1) diagnostics.push(`retry invalido na chamada ${index + 1}`);
    }
    if (enabledFalse !== hookCount) diagnostics.push(`enabled=false registrado ${enabledFalse} vez(es), esperado ${hookCount}`);
    if (enabledTrue !== hookCount) diagnostics.push(`enabled=true registrado ${enabledTrue} vez(es), esperado ${hookCount}`);

    const enabledCalls = queryCalls.filter((call) => call.enabled === true && typeof call.queryFn === 'function');
    for (const call of enabledCalls) {
      const result = await call.queryFn!({ signal: expectedSignal });
      if (!Array.isArray(result)) {
        diagnostics.push('queryFn nao retornou array de opcoes');
        continue;
      }
      normalizedOptions += result.length;
      if (result.length !== 2) diagnostics.push(`queryFn retornou ${result.length} opcoes, esperado 2 apos remover id nulo`);
      const first = result[0] as Record<string, unknown> | undefined;
      const second = result[1] as Record<string, unknown> | undefined;
      if (first?.label !== 'Alpha' || second?.label !== 'Zulu') diagnostics.push('opcoes de lookup nao foram ordenadas pelo label');
      if (first?.id !== 1 || !first.raw || typeof first.raw !== 'object') diagnostics.push('opcao normalizada nao preservou id e raw');
    }
    if (fetchCalls.length !== enabledCalls.length) diagnostics.push(`fetch chamado ${fetchCalls.length} vez(es), esperado ${enabledCalls.length}`);
    for (const call of fetchCalls) {
      if (!call.url.startsWith('/api/')) diagnostics.push(`endpoint de lookup invalido: ${call.url}`);
      if (!call.signalMatches) diagnostics.push(`AbortSignal nao propagado para ${call.url}`);
    }
  } catch (error) {
    diagnostics.push(error instanceof Error ? error.message : String(error));
  }
}

const runtimeMarker = diagnostics.length === 0
  ? `FRONTEND_LOOKUP_HOOKS_OK:${entity}:hooks=${hookCount}:queries=${queryCalls.length}`
  : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  definitionsFile: definitionsFile?.path ?? null,
  hooksFile: hooksFile?.path ?? null,
  exports: exportsFound,
  inferredLookups: resolved.lookups.length,
  definitionsCount,
  hookCount,
  queryCalls: queryCalls.length,
  fetchCalls: fetchCalls.length,
  enabledTrue,
  enabledFalse,
  normalizedOptions,
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao dos hooks de lookup frontend gerados de ${entity}`);
  console.log(`Lookups: ${hookCount}/${resolved.lookups.length}`);
  console.log(`Queries: ${queryCalls.length}`);
  console.log(`Fetches: ${fetchCalls.length}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
