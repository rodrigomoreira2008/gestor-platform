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
  console.error('Uso: validate:frontend-tabbed-form arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const expectedExport = `${entityPascal}TabbedForm`;
const formFile = generated.find((file) => file.path.endsWith(`/components/${expectedExport}.tsx`));
const diagnostics: string[] = [];
let exportsFound: string[] = [];
let nodeCount = 0;
let tabCount = 0;
let tabPanelCount = 0;
let submitButtonCount = 0;
let resetButtonCount = 0;
let dirtyNotifications = 0;
let submissions = 0;
let schemaCalls = 0;
let beforeUnloadAdds = 0;
let beforeUnloadRemoves = 0;

if (!formFile) {
  diagnostics.push(`arquivo components/${expectedExport}.tsx nao foi gerado`);
} else {
  try {
    const source = formFile.content
      .replace(/import\s+\{[^}]+\}\s+from\s+['"]@mui\/material['"];?/, 'const mui = require("virtual:mui"); const { Alert, Badge, Box, Button, Checkbox, FormControlLabel, Stack, Tab, Tabs, TextField, Typography } = mui;')
      .replace(/import\s+\{[^}]+\}\s+from\s+['"]react['"];?/, 'const { useEffect, useMemo, useRef, useState } = require("virtual:react");')
      .replace(new RegExp(`import\\s+\\{\\s*${entityPascal}LookupField\\s*\\}\\s+from\\s+['"][^'"]+['"];?`), `const { ${entityPascal}LookupField } = require("virtual:lookup");`)
      .replace(new RegExp(`import\\s+\\{\\s*${entity.charAt(0).toLowerCase() + entity.slice(1)}Schema\\s*\\}\\s+from\\s+['"][^'"]+['"];?`), `const { ${entity.charAt(0).toLowerCase() + entity.slice(1)}Schema } = require("virtual:schema");`)
      .replace(/^import\s+type\s+[^;]+;?\s*$/gm, '');

    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        strict: true,
        esModuleInterop: true
      },
      fileName: formFile.path,
      reportDiagnostics: true
    });

    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${formFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const stateValues: unknown[] = [];
    let stateCursor = 0;
    const effects: Array<() => void | (() => void)> = [];
    const useState = <T>(initial: T | (() => T)): [T, (value: T | ((current: T) => T)) => void] => {
      const index = stateCursor++;
      if (!(index in stateValues)) stateValues[index] = typeof initial === 'function' ? (initial as () => T)() : initial;
      return [stateValues[index] as T, (value) => {
        const current = stateValues[index] as T;
        stateValues[index] = typeof value === 'function' ? (value as (current: T) => T)(current) : value;
      }];
    };
    const useMemo = <T>(factory: () => T): T => factory();
    const useRef = <T>(value: T): { current: T } => ({ current: value });
    const useEffect = (effect: () => void | (() => void)): void => { effects.push(effect); };

    const makeComponent = (name: string) => Object.assign((props: Record<string, unknown>) => ({ type: name, props }), { displayName: name });
    const mui = Object.fromEntries(['Alert', 'Badge', 'Box', 'Button', 'Checkbox', 'FormControlLabel', 'Stack', 'Tab', 'Tabs', 'TextField', 'Typography'].map((name) => [name, makeComponent(name)]));
    const lookup = makeComponent(`${entityPascal}LookupField`);
    const schema = {
      safeParse: (value: unknown) => {
        schemaCalls += 1;
        return { success: true, data: value };
      }
    };
    const jsx = (type: unknown, props: Record<string, unknown> | null, key?: unknown): JsxNode => ({ type, props: { ...(props ?? {}), ...(key === undefined ? {} : { key }) } });
    const jsxs = jsx;
    const Fragment = Symbol('Fragment');

    const require = (specifier: string): unknown => {
      if (specifier === 'virtual:mui') return mui;
      if (specifier === 'virtual:react') return { useEffect, useMemo, useRef, useState };
      if (specifier === 'virtual:lookup') return { [entityPascal + 'LookupField']: lookup };
      if (specifier === 'virtual:schema') return { [entity.charAt(0).toLowerCase() + entity.slice(1) + 'Schema']: schema };
      if (specifier === 'react/jsx-runtime') return { jsx, jsxs, Fragment };
      throw new Error(`modulo nao permitido: ${specifier}`);
    };

    const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
    const windowStub = {
      addEventListener: (name: string, listener: (...args: unknown[]) => void) => {
        beforeUnloadAdds += name === 'beforeunload' ? 1 : 0;
        const set = listeners.get(name) ?? new Set();
        set.add(listener);
        listeners.set(name, set);
      },
      removeEventListener: (name: string, listener: (...args: unknown[]) => void) => {
        beforeUnloadRemoves += name === 'beforeunload' ? 1 : 0;
        listeners.get(name)?.delete(listener);
      }
    };
    const documentStub = { querySelector: () => ({ focus: () => undefined, scrollIntoView: () => undefined }) };

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, require, console, window: windowStub, document: documentStub, requestAnimationFrame: (callback: () => void) => { callback(); return 1; } });
    new vm.Script(transpiled.outputText, { filename: formFile.path }).runInContext(context, { timeout: 1000 });

    const exported = module.exports as Record<string, unknown>;
    exportsFound = Object.keys(exported).sort();
    const component = exported[expectedExport];
    if (typeof component !== 'function') diagnostics.push(`export ${expectedExport} ausente ou nao executavel`);
    else {
      stateCursor = 0;
      const tree = component({
        initialValue: {},
        onSubmit: () => { submissions += 1; },
        onDirtyChange: () => { dirtyNotifications += 1; },
        isSubmitting: false,
        warnOnUnsavedChanges: true
      }) as JsxNode;

      const nodes = flatten(tree);
      nodeCount = nodes.length;
      tabCount = nodes.filter((node) => typeName(node.type) === 'Tab').length;
      tabPanelCount = nodes.filter((node) => node.props.role === 'tabpanel').length;
      submitButtonCount = nodes.filter((node) => typeName(node.type) === 'Button' && node.props.type === 'submit').length;
      resetButtonCount = nodes.filter((node) => typeName(node.type) === 'Button' && node.props.type === 'button').length;

      if (typeName(tree.type) !== 'Stack') diagnostics.push(`raiz esperada Stack, recebido ${typeName(tree.type)}`);
      if (tree.props.component !== 'form') diagnostics.push('container raiz nao esta configurado como formulario');
      if (typeof tree.props.onSubmit !== 'function') diagnostics.push('onSubmit do formulario ausente');
      if (tabCount < 1) diagnostics.push('nenhuma aba renderizada');
      if (tabPanelCount !== tabCount) diagnostics.push(`painéis=${tabPanelCount}, abas=${tabCount}`);
      if (submitButtonCount !== 1) diagnostics.push(`botoes submit=${submitButtonCount}, esperado 1`);
      if (resetButtonCount < 1) diagnostics.push('botao Restaurar ausente');

      for (const effect of effects) {
        const cleanup = effect();
        if (typeof cleanup === 'function') cleanup();
      }

      if (typeof tree.props.onSubmit === 'function') {
        tree.props.onSubmit({ preventDefault: () => undefined });
      }
      if (schemaCalls !== 1) diagnostics.push(`schema.safeParse chamado ${schemaCalls} vez(es), esperado 1`);
      if (submissions !== 1) diagnostics.push(`onSubmit externo chamado ${submissions} vez(es), esperado 1`);
      if (dirtyNotifications < 1) diagnostics.push('onDirtyChange nao foi notificado');
      if (beforeUnloadAdds !== beforeUnloadRemoves) diagnostics.push(`listener beforeunload sem limpeza: adicionados=${beforeUnloadAdds}, removidos=${beforeUnloadRemoves}`);
    }
  } catch (error) {
    diagnostics.push(`${formFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const runtimeMarker = diagnostics.length === 0 ? `FRONTEND_TABBED_FORM_OK:${entity}:tabs=${tabCount}:nodes=${nodeCount}` : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  formFile: formFile?.path ?? null,
  expectedExport,
  exports: exportsFound,
  nodeCount,
  tabCount,
  tabPanelCount,
  submitButtonCount,
  resetButtonCount,
  dirtyNotifications,
  submissions,
  schemaCalls,
  beforeUnloadAdds,
  beforeUnloadRemoves,
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao do formulario frontend com abas de ${entity}`);
  console.log(`Arquivo: ${output.formFile ?? 'nao encontrado'}`);
  console.log(`Abas: ${tabCount}; paineis: ${tabPanelCount}; nos: ${nodeCount}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);

function flatten(value: unknown): JsxNode[] {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(flatten);
  const node = value as JsxNode;
  if (!('type' in node) || !('props' in node)) return [];
  return [node, ...flatten(node.props.children)];
}

function typeName(type: unknown): string {
  if (typeof type === 'string') return type;
  if (typeof type === 'function') return (type as { displayName?: string; name?: string }).displayName ?? (type as { name?: string }).name ?? 'Function';
  return String(type);
}
