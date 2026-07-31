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
  refetchOnWindowFocus?: boolean;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-detail-hooks arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const hookFile = generated.find((file) => file.path.endsWith(`/details/${entityCamel}DetailHooks.ts`));
const diagnostics: string[] = [];
const queryCalls: QueryOptions[] = [];
const fetchCalls: Array<{ url: string; signalMatches: boolean }> = [];
let exportsFound: string[] = [];
let enabledTrue = 0;
let enabledFalse = 0;
let apiCalls = 0;

if (!hookFile) {
  diagnostics.push(`arquivo details/${entityCamel}DetailHooks.ts nao foi gerado`);
} else {
  try {
    const transpiled = ts.transpileModule(hookFile.content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        esModuleInterop: true
      },
      fileName: hookFile.path,
      reportDiagnostics: true
    });

    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${hookFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const useQuery = (options: QueryOptions): QueryOptions => {
      queryCalls.push(options);
      if (options.enabled === true) enabledTrue += 1;
      if (options.enabled === false) enabledFalse += 1;
      return options;
    };

    let activeSignal: AbortSignal | null = null;
    const fetchStub = async (url: string, init?: { signal?: AbortSignal }) => {
      apiCalls += 1;
      fetchCalls.push({ url: String(url), signalMatches: Boolean(activeSignal && init?.signal === activeSignal) });
      return {
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({ items: [{ id: 1, descricao: 'Detalhe' }] })
      };
    };

    const require = (specifier: string): unknown => {
      if (specifier === '@tanstack/react-query') return { useQuery };
      throw new Error(`modulo nao permitido: ${specifier}`);
    };

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({
      module,
      exports: module.exports,
      require,
      console,
      fetch: fetchStub,
      URLSearchParams,
      AbortController,
      Error,
      Array,
      Object,
      String
    });
    new vm.Script(transpiled.outputText, { filename: hookFile.path }).runInContext(context, { timeout: 1000 });

    const exported = module.exports as Record<string, unknown>;
    exportsFound = Object.keys(exported).sort();

    for (const grid of resolved.detailGrids) {
      const hookName = `use${entityPascal}${toPascalCase(grid.name)}Details`;
      const hook = exported[hookName];
      if (typeof hook !== 'function') {
        diagnostics.push(`export ${hookName} ausente ou nao executavel`);
        continue;
      }

      const beforeDisabled = queryCalls.length;
      (hook as (masterId?: string | number) => unknown)(undefined);
      const disabledOptions = queryCalls[beforeDisabled];
      if (!disabledOptions) diagnostics.push(`${hookName} nao chamou useQuery sem masterId`);
      else {
        if (disabledOptions.enabled !== false) diagnostics.push(`${hookName} deveria desabilitar consulta sem masterId`);
        validateStaticOptions(hookName, disabledOptions, diagnostics);
      }

      const beforeEnabled = queryCalls.length;
      const masterId = 15;
      (hook as (masterId?: string | number) => unknown)(masterId);
      const enabledOptions = queryCalls[beforeEnabled];
      if (!enabledOptions) {
        diagnostics.push(`${hookName} nao chamou useQuery com masterId`);
        continue;
      }

      if (enabledOptions.enabled !== true) diagnostics.push(`${hookName} deveria habilitar consulta com masterId`);
      validateStaticOptions(hookName, enabledOptions, diagnostics);

      const expectedEndpoint = `/api/${toKebabPlural(stripDatasetPrefix(grid.dataSource ?? grid.name))}`;
      const expectedRelationField = grid.detailField ? normalizeParamName(grid.detailField) : inferRelationField(grid.relationship);
      const expectedKey = ['detail', grid.name, expectedEndpoint, expectedRelationField, masterId];
      if (JSON.stringify(enabledOptions.queryKey) !== JSON.stringify(expectedKey)) {
        diagnostics.push(`${hookName} gerou queryKey incorreta: ${JSON.stringify(enabledOptions.queryKey)}`);
      }

      if (typeof enabledOptions.queryFn !== 'function') {
        diagnostics.push(`${hookName} nao forneceu queryFn`);
      } else {
        const controller = new AbortController();
        activeSignal = controller.signal;
        const rows = await enabledOptions.queryFn({ signal: controller.signal });
        activeSignal = null;
        if (!Array.isArray(rows) || rows.length !== 1) diagnostics.push(`${hookName} nao normalizou envelope items`);
        const lastFetch = fetchCalls.at(-1);
        const expectedUrl = `${expectedEndpoint}?${expectedRelationField}=${masterId}`;
        if (!lastFetch || lastFetch.url !== expectedUrl) diagnostics.push(`${hookName} chamou endpoint incorreto: ${lastFetch?.url ?? 'nenhum'}`);
        if (lastFetch && !lastFetch.signalMatches) diagnostics.push(`${hookName} nao propagou AbortSignal ao fetch`);
      }
    }

    if (resolved.detailGrids.length === 0 && exportsFound.some((name) => name.startsWith('use'))) {
      diagnostics.push(`foram exportados hooks sem grids inferidos: ${exportsFound.join(', ')}`);
    }
  } catch (error) {
    diagnostics.push(`${hookFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const expectedQueries = resolved.detailGrids.length * 2;
if (queryCalls.length !== expectedQueries) diagnostics.push(`useQuery chamado ${queryCalls.length} vez(es), esperado ${expectedQueries}`);
if (enabledTrue !== resolved.detailGrids.length) diagnostics.push(`consultas habilitadas: ${enabledTrue}, esperado ${resolved.detailGrids.length}`);
if (enabledFalse !== resolved.detailGrids.length) diagnostics.push(`consultas desabilitadas: ${enabledFalse}, esperado ${resolved.detailGrids.length}`);
if (apiCalls !== resolved.detailGrids.length) diagnostics.push(`fetch chamado ${apiCalls} vez(es), esperado ${resolved.detailGrids.length}`);

const runtimeMarker = diagnostics.length === 0
  ? `FRONTEND_DETAIL_HOOKS_OK:${entity}:hooks=${resolved.detailGrids.length}:queries=${queryCalls.length}`
  : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  hookFile: hookFile?.path ?? null,
  exports: exportsFound,
  hookCount: resolved.detailGrids.length,
  queryCalls: queryCalls.length,
  apiCalls,
  enabledTrue,
  enabledFalse,
  cacheKeys: queryCalls.map((call) => call.queryKey ?? []),
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao dos hooks de detalhe frontend gerados de ${entity}`);
  console.log(`Arquivo: ${output.hookFile ?? 'nao encontrado'}`);
  console.log(`Hooks: ${output.hookCount}`);
  console.log(`Consultas: ${output.queryCalls}`);
  console.log(`Fetches: ${output.apiCalls}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);

function validateStaticOptions(hookName: string, options: QueryOptions, target: string[]): void {
  if (options.staleTime !== 30_000) target.push(`${hookName} staleTime invalido: ${String(options.staleTime)}`);
  if (options.retry !== 1) target.push(`${hookName} retry invalido: ${String(options.retry)}`);
  if (options.refetchOnWindowFocus !== false) target.push(`${hookName} deveria desabilitar refetchOnWindowFocus`);
}

function inferRelationField(relationship?: string): string {
  if (!relationship) return 'masterId';
  const [source] = relationship.split('->').map((part) => part.trim());
  const column = source.includes('.') ? source.split('.').pop() : source;
  return normalizeParamName(column ?? 'masterId');
}

function stripDatasetPrefix(value: string): string {
  return value.replace(/^(?:ds|qry|cds|fdq|ado|tbl|tb)/i, '') || value;
}

function normalizeParamName(value: string): string {
  const pascal = toPascalCase(value);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : 'masterId';
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toKebabPlural(value: string): string {
  const kebab = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}
