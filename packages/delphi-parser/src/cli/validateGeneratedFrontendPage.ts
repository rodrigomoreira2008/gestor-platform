import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface ElementNode { type: unknown; props: Record<string, unknown>; key?: unknown; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-page arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
const diagnostics: string[] = [];
const componentCalls = new Map<string, number>();
let exportsFound: string[] = [];
let rootType: string | null = null;
let nodeCount = 0;

function createElement(type: unknown, props: Record<string, unknown> | null, key?: unknown): ElementNode {
  const name = typeof type === 'string' ? type : typeof type === 'function' ? (type.name || 'Anonymous') : String(type);
  componentCalls.set(name, (componentCalls.get(name) ?? 0) + 1);
  return { type, props: props ?? {}, key };
}

function component(name: string): (props: Record<string, unknown>) => ElementNode {
  return function GeneratedStub(props: Record<string, unknown>) {
    componentCalls.set(name, (componentCalls.get(name) ?? 0) + 1);
    return { type: name, props };
  };
}

function visit(value: unknown, seen = new Set<unknown>()): void {
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return;
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) visit(item, seen);
    return;
  }
  if (typeof value !== 'object') return;
  nodeCount += 1;
  const record = value as Record<string, unknown>;
  visit(record.props, seen);
  if (record.props && typeof record.props === 'object') {
    visit((record.props as Record<string, unknown>).children, seen);
  }
}

if (!pageFile) {
  diagnostics.push(`arquivo pages/${entityPascal}Page.tsx nao foi gerado`);
} else {
  try {
    let source = pageFile.content;
    source = source.replace(/^import\s+type\s+[^;]+;?\s*$/gm, '');
    source = source.replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?\s*$/gm, (_match, names: string, specifier: string) => {
      return `const { ${names.trim()} } = require(${JSON.stringify(specifier)});`;
    });

    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        strict: true,
        esModuleInterop: true
      },
      fileName: pageFile.path,
      reportDiagnostics: true
    });

    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${pageFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const stateValues: unknown[] = [false, null, null, null, '', {}];
    let stateIndex = 0;
    const reactModule = {
      useState: (initial: unknown) => {
        const value = stateValues[stateIndex] ?? initial;
        stateIndex += 1;
        return [value, () => undefined];
      },
      useMemo: (factory: () => unknown) => factory()
    };

    const listResult = { data: [{ id: 1, nome: 'Teste' }], isLoading: false, isError: false };
    const mutationResult = { isPending: false, mutate: () => undefined };
    const hooksModule: Record<string, unknown> = {
      [`use${entityPascal}s`]: () => listResult,
      [`useCreate${entityPascal}`]: () => mutationResult,
      [`useUpdate${entityPascal}`]: () => mutationResult,
      [`useRemove${entityPascal}`]: () => mutationResult
    };

    for (const grid of resolved.detailGrids) {
      const gridPascal = grid.name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
      hooksModule[`use${entityPascal}${gridPascal}Details`] = () => ({ data: [], isLoading: false, error: null });
    }

    const muiNames = ['Alert', 'Box', 'Button', 'Dialog', 'DialogActions', 'DialogContent', 'DialogTitle', 'IconButton', 'InputAdornment', 'Stack', 'TextField', 'Typography'];
    const muiModule = Object.fromEntries(muiNames.map((name) => [name, component(name)]));
    const iconsModule = Object.fromEntries(['Add', 'Delete', 'Edit', 'Search'].map((name) => [name, component(name)]));
    const dataGridModule = { DataGrid: component('DataGrid'), GridColDef: undefined };
    const localModules: Record<string, unknown> = {
      '../hooks': hooksModule,
      [`../components/${entityPascal}Filters`]: { [`${entityPascal}Filters`]: component(`${entityPascal}Filters`) },
      [`../components/${entityPascal}TabbedForm`]: { [`${entityPascal}TabbedForm`]: component(`${entityPascal}TabbedForm`) },
      [`../filters/${entity.charAt(0).toLowerCase() + entity.slice(1)}Filters`]: { [`${entity.charAt(0).toLowerCase() + entity.slice(1)}Filters`]: [{ name: 'nome' }] },
      [`../tabs/${entity.charAt(0).toLowerCase() + entity.slice(1)}Tabs`]: { [`${entity.charAt(0).toLowerCase() + entity.slice(1)}Tabs`]: [] },
      [`../table/${entity.charAt(0).toLowerCase() + entity.slice(1)}Columns`]: { [`${entity.charAt(0).toLowerCase() + entity.slice(1)}Columns`]: [{ field: 'id' }] }
    };

    for (const grid of resolved.detailGrids) {
      const gridPascal = grid.name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
      localModules[`../details/${entityPascal}${gridPascal}DetailGrid`] = { [`${entityPascal}${gridPascal}DetailGrid`]: component(`${entityPascal}${gridPascal}DetailGrid`) };
    }
    if (resolved.detailGrids.length > 0) localModules[`../details/${entity.charAt(0).toLowerCase() + entity.slice(1)}DetailHooks`] = hooksModule;

    const require = (specifier: string): unknown => {
      if (specifier === 'react') return reactModule;
      if (specifier === 'react/jsx-runtime') return { jsx: createElement, jsxs: createElement, Fragment: 'Fragment' };
      if (specifier === '@mui/material') return muiModule;
      if (specifier === '@mui/icons-material') return iconsModule;
      if (specifier === '@mui/x-data-grid') return dataGridModule;
      if (specifier in localModules) return localModules[specifier];
      throw new Error(`modulo nao permitido: ${specifier}`);
    };

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, require, console });
    new vm.Script(transpiled.outputText, { filename: pageFile.path }).runInContext(context, { timeout: 1000 });
    const exported = module.exports as Record<string, unknown>;
    exportsFound = Object.keys(exported).sort();
    const page = exported[`${entityPascal}Page`];
    if (typeof page !== 'function') {
      diagnostics.push(`export ${entityPascal}Page ausente ou nao executavel`);
    } else {
      const tree = page() as ElementNode;
      rootType = typeof tree?.type === 'string' ? tree.type : typeof tree?.type === 'function' ? tree.type.name : null;
      visit(tree);
      if (!tree || typeof tree !== 'object') diagnostics.push('pagina nao retornou uma arvore JSX valida');
      if ((componentCalls.get('Stack') ?? 0) < 1) diagnostics.push('pagina nao renderizou o container Stack principal');
      if ((componentCalls.get('DataGrid') ?? 0) < 1 && !JSON.stringify(tree).includes('DataGrid')) diagnostics.push('pagina nao inclui DataGrid');
      if ((componentCalls.get('DialogTitle') ?? 0) < 1 && !JSON.stringify(tree).includes('DialogTitle')) diagnostics.push('pagina nao inclui DialogTitle');
      if (!pageFile.content.includes('aria-label="Editar"') || !pageFile.content.includes('aria-label="Excluir"')) diagnostics.push('acoes da pagina nao possuem nomes acessiveis esperados');
      if (!pageFile.content.includes('onRowClick')) diagnostics.push('pagina nao conecta selecao de linha');
      if (!pageFile.content.includes('create.mutate') || !pageFile.content.includes('update.mutate') || !pageFile.content.includes('remove.mutate')) diagnostics.push('pagina nao conecta todas as mutacoes CRUD');
    }
  } catch (error) {
    diagnostics.push(`${pageFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const runtimeMarker = diagnostics.length === 0 ? `FRONTEND_PAGE_OK:${entity}:nodes=${nodeCount}:components=${componentCalls.size}` : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  pageFile: pageFile?.path ?? null,
  expectedExport: `${entityPascal}Page`,
  exports: exportsFound,
  rootType,
  nodeCount,
  components: Object.fromEntries([...componentCalls.entries()].sort(([a], [b]) => a.localeCompare(b))),
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao da pagina frontend gerada de ${entity}`);
  console.log(`Arquivo: ${output.pageFile ?? 'nao encontrado'}`);
  console.log(`Export: ${output.expectedExport}`);
  console.log(`Nos JSX: ${nodeCount}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
