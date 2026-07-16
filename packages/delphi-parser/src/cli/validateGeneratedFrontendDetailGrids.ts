import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface JsxNode { type: unknown; props: Record<string, unknown>; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-detail-grids arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const definitionsFile = generated.find((file) => file.path.endsWith(`/details/${entityCamel}DetailGrids.ts`));
const componentFiles = generated.filter((file) => /\/details\/[^/]+DetailGrid\.tsx$/.test(file.path));
const diagnostics: string[] = [];
let definitionsCount = 0;
let componentCount = 0;
let dataGridCount = 0;
let toolbarCount = 0;
let alertCount = 0;
let generatedRowIds = 0;
let naturalRowIds = 0;
let exportsFound: string[] = [];

const jsx = (type: unknown, props: Record<string, unknown> | null, key?: unknown): JsxNode => ({
  type,
  props: { ...(props ?? {}), ...(key === undefined ? {} : { key }) }
});

function component(name: string): (props: Record<string, unknown>) => JsxNode {
  const fn = (props: Record<string, unknown>) => jsx(name, props);
  Object.defineProperty(fn, 'name', { value: name });
  return fn;
}

function childrenOf(node: JsxNode): unknown[] {
  const children = node.props.children;
  if (children === undefined || children === null) return [];
  return Array.isArray(children) ? children.flat(Infinity) : [children];
}

function walk(value: unknown, visit: (node: JsxNode) => void): void {
  if (!value || typeof value !== 'object') return;
  const node = value as Partial<JsxNode>;
  if (!('type' in node) || !node.props || typeof node.props !== 'object') return;
  visit(node as JsxNode);
  for (const child of childrenOf(node as JsxNode)) walk(child, visit);
}

function transpile(file: GeneratedFile): string {
  const result = ts.transpileModule(file.content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
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

if (!definitionsFile) {
  diagnostics.push(`arquivo details/${entityCamel}DetailGrids.ts nao foi gerado`);
} else {
  try {
    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, console });
    new vm.Script(transpile(definitionsFile), { filename: definitionsFile.path }).runInContext(context, { timeout: 1000 });
    const exported = module.exports as Record<string, unknown>;
    exportsFound.push(...Object.keys(exported));
    const definitions = exported[`${entityCamel}DetailGrids`];
    if (!Array.isArray(definitions)) diagnostics.push(`export ${entityCamel}DetailGrids ausente ou nao e array`);
    else {
      definitionsCount = definitions.length;
      if (definitions.length !== resolved.detailGrids.length) diagnostics.push(`definicoes=${definitions.length}, inferidas=${resolved.detailGrids.length}`);
      for (const definition of definitions as Array<Record<string, unknown>>) {
        if (!definition.name || !definition.label || !definition.confidence || !definition.evidence) diagnostics.push('definicao de grid de detalhe incompleta');
        if (!Array.isArray(definition.fieldNames)) diagnostics.push('fieldNames de grid de detalhe nao e array');
      }
    }
  } catch (error) {
    diagnostics.push(`${definitionsFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (componentFiles.length !== resolved.detailGrids.length) {
  diagnostics.push(`componentes de detalhe=${componentFiles.length}, inferidos=${resolved.detailGrids.length}`);
}

for (const file of componentFiles) {
  try {
    const material = {
      Alert: component('Alert'),
      Box: component('Box'),
      Chip: component('Chip'),
      Stack: component('Stack'),
      Typography: component('Typography')
    };
    const dataGrid = component('DataGrid');
    const gridToolbar = component('GridToolbar');
    const require = (specifier: string): unknown => {
      if (specifier === 'react') return { useMemo: (factory: () => unknown) => factory() };
      if (specifier === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
      if (specifier === '@mui/material') return material;
      if (specifier === '@mui/x-data-grid') return { DataGrid: dataGrid, GridToolbar: gridToolbar };
      throw new Error(`modulo nao permitido: ${specifier}`);
    };
    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, require, console, Error, JSON });
    new vm.Script(transpile(file), { filename: file.path }).runInContext(context, { timeout: 1000 });
    const exported = module.exports as Record<string, unknown>;
    exportsFound.push(...Object.keys(exported));
    const render = Object.values(exported).find((value) => typeof value === 'function') as ((props: Record<string, unknown>) => unknown) | undefined;
    if (!render) {
      diagnostics.push(`${file.path}: componente exportado ausente`);
      continue;
    }
    componentCount += 1;
    const rows = [{ id: 7, descricao: 'Natural' }, { descricao: 'Gerado' }];
    const tree = render({ rows, isLoading: true, error: new Error('Falha controlada'), height: 410 });
    let gridProps: Record<string, unknown> | null = null;
    walk(tree, (node) => {
      const typeName = typeof node.type === 'string' ? node.type : typeof node.type === 'function' ? node.type.name : String(node.type);
      if (typeName === 'DataGrid') { dataGridCount += 1; gridProps = node.props; }
      if (typeName === 'GridToolbar') toolbarCount += 1;
      if (typeName === 'Alert') alertCount += 1;
    });
    if (!gridProps) {
      diagnostics.push(`${file.path}: DataGrid nao renderizado`);
      continue;
    }
    const normalizedRows = gridProps.rows;
    if (!Array.isArray(normalizedRows) || normalizedRows.length !== 2) diagnostics.push(`${file.path}: linhas nao foram normalizadas`);
    else {
      if ((normalizedRows[0] as Record<string, unknown>).__generatedRowId === 7) naturalRowIds += 1;
      else diagnostics.push(`${file.path}: id natural nao foi preservado`);
      const generatedId = (normalizedRows[1] as Record<string, unknown>).__generatedRowId;
      if (typeof generatedId === 'string' && generatedId.startsWith('1:')) generatedRowIds += 1;
      else diagnostics.push(`${file.path}: id sintetico nao foi gerado`);
    }
    if (gridProps.loading !== true) diagnostics.push(`${file.path}: loading nao propagado`);
    if (typeof gridProps.getRowId !== 'function') diagnostics.push(`${file.path}: getRowId ausente`);
    if ((gridProps.slots as Record<string, unknown> | undefined)?.toolbar !== gridToolbar) diagnostics.push(`${file.path}: toolbar nao configurada`);
    if ((gridProps.slotProps as Record<string, any> | undefined)?.toolbar?.showQuickFilter !== true) diagnostics.push(`${file.path}: quick filter nao habilitado`);
  } catch (error) {
    diagnostics.push(`${file.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (resolved.detailGrids.length === 0 && componentFiles.length === 0) {
  componentCount = 0;
}
if (componentCount > 0 && alertCount !== componentCount) diagnostics.push(`Alert renderizado ${alertCount} vez(es), esperado ${componentCount}`);

exportsFound = [...new Set(exportsFound)].sort();
const runtimeMarker = diagnostics.length === 0
  ? `FRONTEND_DETAIL_GRIDS_OK:${entity}:grids=${resolved.detailGrids.length}:components=${componentCount}`
  : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  definitionsFile: definitionsFile?.path ?? null,
  componentFiles: componentFiles.map((file) => file.path),
  exports: exportsFound,
  inferredDetailGrids: resolved.detailGrids.length,
  definitionsCount,
  componentCount,
  dataGridCount,
  toolbarCount,
  alertCount,
  naturalRowIds,
  generatedRowIds,
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao dos grids de detalhe frontend gerados de ${entity}`);
  console.log(`Grids inferidos: ${resolved.detailGrids.length}`);
  console.log(`Componentes executados: ${componentCount}`);
  console.log(`DataGrids: ${dataGridCount}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
