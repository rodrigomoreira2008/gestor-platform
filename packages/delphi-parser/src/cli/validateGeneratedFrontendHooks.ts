import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface HookCall { resource: string; apiMatches: boolean; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-hooks arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const hooksFile = generated.find((file) => file.path.endsWith('/hooks/index.ts'));
const diagnostics: string[] = [];
const calls: HookCall[] = [];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const expectedExports = [
  `use${entityPascal}s`,
  `useCreate${entityPascal}`,
  `useUpdate${entityPascal}`,
  `useRemove${entityPascal}`
];

let exportsFound: string[] = [];
let resource: string | null = null;

if (!hooksFile) {
  diagnostics.push('arquivo hooks/index.ts nao foi gerado');
} else {
  try {
    let source = hooksFile.content
      .replace(/import\s+\{\s*useCrudResource\s*\}\s+from\s+['"][^'"]+['"];?/, 'const { useCrudResource } = require("virtual:crud");')
      .replace(new RegExp(`import\\s+\\{\\s*${entityCamel}ResourceApi\\s*\\}\\s+from\\s+['\"][^'\"]+['\"];?`), `const { ${entityCamel}ResourceApi } = require("virtual:api");`)
      .replace(/^import\s+type\s+[^;]+;?\s*$/gm, '');

    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        esModuleInterop: true
      },
      fileName: hooksFile.path,
      reportDiagnostics: true
    });

    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${hooksFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const api = { marker: `${entityCamel}-api` };
    const hookResult = {
      list: { kind: 'list' },
      create: { kind: 'create' },
      update: { kind: 'update' },
      remove: { kind: 'remove' }
    };
    const require = (specifier: string): unknown => {
      if (specifier === 'virtual:api') return { [`${entityCamel}ResourceApi`]: api };
      if (specifier === 'virtual:crud') return {
        useCrudResource: (resourceName: string, receivedApi: unknown) => {
          resource = resourceName;
          calls.push({ resource: resourceName, apiMatches: receivedApi === api });
          return hookResult;
        }
      };
      throw new Error(`modulo nao permitido: ${specifier}`);
    };

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, require, console });
    new vm.Script(transpiled.outputText, { filename: hooksFile.path }).runInContext(context, { timeout: 1000 });

    const exported = module.exports as Record<string, unknown>;
    exportsFound = Object.keys(exported).sort();
    for (const expected of expectedExports) {
      if (typeof exported[expected] !== 'function') diagnostics.push(`export ${expected} ausente ou nao executavel`);
    }

    const expectedKinds: Record<string, string> = {
      [`use${entityPascal}s`]: 'list',
      [`useCreate${entityPascal}`]: 'create',
      [`useUpdate${entityPascal}`]: 'update',
      [`useRemove${entityPascal}`]: 'remove'
    };

    for (const [name, kind] of Object.entries(expectedKinds)) {
      const hook = exported[name];
      if (typeof hook !== 'function') continue;
      const result = hook() as { kind?: string };
      if (result?.kind !== kind) diagnostics.push(`${name} retornou ${String(result?.kind)} em vez de ${kind}`);
    }

    if (calls.length !== 4) diagnostics.push(`useCrudResource chamado ${calls.length} vez(es), esperado 4`);
    if (calls.some((call) => !call.apiMatches)) diagnostics.push('hook encaminhou uma instancia de API incorreta');
    if (!resource) diagnostics.push('nome do recurso nao foi capturado');
    if (resource && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resource)) diagnostics.push(`recurso fora de kebab-case: ${resource}`);
  } catch (error) {
    diagnostics.push(`${hooksFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const runtimeMarker = diagnostics.length === 0 ? `FRONTEND_HOOKS_OK:${entity}:resource=${resource}:calls=${calls.length}` : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  hooksFile: hooksFile?.path ?? null,
  resource,
  exports: exportsFound,
  calls,
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao dos hooks frontend gerados de ${entity}`);
  console.log(`Arquivo: ${output.hooksFile ?? 'nao encontrado'}`);
  console.log(`Recurso: ${resource ?? 'nao identificado'}`);
  console.log(`Exports: ${exportsFound.join(', ') || 'nenhum'}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
