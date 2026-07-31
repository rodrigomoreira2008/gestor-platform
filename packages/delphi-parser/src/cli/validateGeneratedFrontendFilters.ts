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
  console.error('Uso: validate:frontend-filters arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const componentFile = generated.find((file) => file.path.endsWith(`/components/${entityPascal}Filters.tsx`));
const definitionsFile = generated.find((file) => file.path.endsWith(`/filters/${entity}Filters.ts`));
const diagnostics: string[] = [];
const changes: unknown[] = [];
const stateInitializers: unknown[] = [];
const stateUpdates: unknown[] = [];
let exportsFound: string[] = [];
let nodeCount = 0;
let textFieldCount = 0;
let selectCount = 0;
let applyButtonCount = 0;
let clearButtonCount = 0;
let applyCalls = 0;
let clearCalls = 0;

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

function typeName(node: JsxNode): string {
  return typeof node.type === 'string' ? node.type : typeof node.type === 'function' ? node.type.name : String(node.type);
}

if (!componentFile) diagnostics.push(`arquivo components/${entityPascal}Filters.tsx nao foi gerado`);
if (!definitionsFile) diagnostics.push(`arquivo filters/${entity}Filters.ts nao foi gerado`);

if (componentFile && definitionsFile) {
  try {
    const definitionsTranspiled = ts.transpileModule(definitionsFile.content, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, strict: true },
      fileName: definitionsFile.path,
      reportDiagnostics: true
    });
    for (const diagnostic of definitionsTranspiled.diagnostics ?? []) {
      diagnostics.push(`${definitionsFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }
    const definitionsModule = { exports: {} as Record<string, unknown> };
    new vm.Script(definitionsTranspiled.outputText, { filename: definitionsFile.path }).runInContext(
      vm.createContext({ module: definitionsModule, exports: definitionsModule.exports }),
      { timeout: 1000 }
    );
    const filterDefinitions = definitionsModule.exports[`${entity}Filters`];
    if (!Array.isArray(filterDefinitions)) diagnostics.push(`export ${entity}Filters ausente ou nao e array`);

    let currentState: Record<string, unknown> = {};
    const useState = (initializer: unknown): [unknown, (value: unknown) => void] => {
      currentState = (typeof initializer === 'function' ? (initializer as () => Record<string, unknown>)() : initializer) as Record<string, unknown>;
      stateInitializers.push(currentState);
      return [currentState, (value: unknown) => {
        currentState = (typeof value === 'function' ? (value as (previous: Record<string, unknown>) => Record<string, unknown>)(currentState) : value) as Record<string, unknown>;
        stateUpdates.push(currentState);
      }];
    };
    const useEffect = (effect: () => unknown): void => { effect(); };
    const material = {
      Button: component('Button'), FormControl: component('FormControl'), InputLabel: component('InputLabel'),
      MenuItem: component('MenuItem'), Select: component('Select'), Stack: component('Stack'), TextField: component('TextField')
    };
    const require = (specifier: string): unknown => {
      if (specifier === 'react') return { useEffect, useState };
      if (specifier === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
      if (specifier === '@mui/material') return material;
      if (specifier === `../filters/${entity}Filters`) return definitionsModule.exports;
      throw new Error(`modulo nao permitido: ${specifier}`);
    };

    const transpiled = ts.transpileModule(componentFile.content, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, strict: true, esModuleInterop: true },
      fileName: componentFile.path,
      reportDiagnostics: true
    });
    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${componentFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const module = { exports: {} as Record<string, unknown> };
    new vm.Script(transpiled.outputText, { filename: componentFile.path }).runInContext(
      vm.createContext({ module, exports: module.exports, require, console, Object }),
      { timeout: 1000 }
    );
    exportsFound = Object.keys(module.exports).sort();
    const filtersComponent = module.exports[`${entityPascal}Filters`];
    if (typeof filtersComponent !== 'function') {
      diagnostics.push(`export ${entityPascal}Filters ausente ou nao executavel`);
    } else {
      const initialValue = { texto: 'abc', vazio: '', nulo: null, indefinido: undefined, ativo: false };
      const tree = (filtersComponent as (props: Record<string, unknown>) => unknown)({
        value: initialValue,
        disabled: false,
        onChange: (value: unknown) => changes.push(value)
      });
      if (!tree || typeof tree !== 'object') diagnostics.push('componente nao retornou arvore JSX valida');
      else {
        const root = tree as JsxNode;
        if (root.props.component !== 'section') diagnostics.push('container raiz nao usa component="section"');
        if (root.props['aria-label'] !== 'Filtros avançados') diagnostics.push('container raiz sem aria-label esperado');
        const buttons: JsxNode[] = [];
        walk(root, (node) => {
          nodeCount += 1;
          const name = typeName(node);
          if (name === 'TextField') {
            textFieldCount += 1;
            if (typeof node.props.onKeyDown === 'function') {
              (node.props.onKeyDown as (event: { key: string }) => void)({ key: 'Enter' });
              applyCalls += 1;
            }
          }
          if (name === 'Select') selectCount += 1;
          if (name === 'Button') buttons.push(node);
        });
        for (const button of buttons) {
          const label = childrenOf(button).join('');
          if (label === 'Aplicar filtros') {
            applyButtonCount += 1;
            if (typeof button.props.onClick === 'function') {
              (button.props.onClick as () => void)();
              applyCalls += 1;
            }
          }
          if (label === 'Limpar') {
            clearButtonCount += 1;
            if (typeof button.props.onClick === 'function') {
              (button.props.onClick as () => void)();
              clearCalls += 1;
            }
          }
        }
      }
    }

    const expectedControls = Math.min(Array.isArray(filterDefinitions) ? filterDefinitions.length : 0, 8);
    if (textFieldCount + selectCount < Math.max(1, expectedControls)) diagnostics.push(`controles renderizados insuficientes: ${textFieldCount + selectCount}/${expectedControls}`);
    if (applyButtonCount !== 1) diagnostics.push(`botao Aplicar filtros encontrado ${applyButtonCount} vez(es), esperado 1`);
    if (clearButtonCount !== 1) diagnostics.push(`botao Limpar encontrado ${clearButtonCount} vez(es), esperado 1`);
    if (applyCalls < 1) diagnostics.push('acao de aplicar filtros nao foi exercitada');
    if (clearCalls !== 1) diagnostics.push(`acao de limpar chamada ${clearCalls} vez(es), esperado 1`);
    if (changes.length < 2) diagnostics.push(`onChange chamado ${changes.length} vez(es), esperado ao menos 2`);
    const normalized = changes.find((value) => value && typeof value === 'object' && (value as Record<string, unknown>).texto === 'abc') as Record<string, unknown> | undefined;
    if (!normalized) diagnostics.push('aplicacao nao encaminhou os filtros preenchidos');
    if (normalized && ('vazio' in normalized || 'nulo' in normalized || 'indefinido' in normalized)) diagnostics.push('aplicacao nao removeu valores vazios');
    if (!changes.some((value) => value && typeof value === 'object' && Object.keys(value as object).length === 0)) diagnostics.push('limpeza nao encaminhou objeto vazio');
  } catch (error) {
    diagnostics.push(`${componentFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const runtimeMarker = diagnostics.length === 0 ? `FRONTEND_FILTERS_OK:${entity}:controls=${textFieldCount + selectCount}:changes=${changes.length}` : null;
const output = {
  ok: diagnostics.length === 0, entity, generatedFiles: generated.length, componentFile: componentFile?.path ?? null,
  definitionsFile: definitionsFile?.path ?? null, expectedExport: `${entityPascal}Filters`, exports: exportsFound,
  nodeCount, textFieldCount, selectCount, applyButtonCount, clearButtonCount, stateInitializers: stateInitializers.length,
  stateUpdates: stateUpdates.length, applyCalls, clearCalls, changes: changes.length, runtimeMarker, diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao dos filtros frontend gerados de ${entity}`);
  console.log(`Arquivo: ${output.componentFile ?? 'nao encontrado'}`);
  console.log(`Controles: ${textFieldCount + selectCount}`);
  console.log(`Alteracoes emitidas: ${changes.length}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
