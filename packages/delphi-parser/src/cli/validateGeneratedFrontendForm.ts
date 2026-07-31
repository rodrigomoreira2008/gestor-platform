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
  console.error('Uso: validate:frontend-form arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const formFile = generated.find((file) => file.path.endsWith(`/components/${entityPascal}Form.tsx`));
const diagnostics: string[] = [];
const stateInitializers: unknown[] = [];
const stateUpdates: unknown[] = [];
const submissions: unknown[] = [];
let exportsFound: string[] = [];
let rootType: string | null = null;
let nodeCount = 0;
let inputCount = 0;
let submitButtonCount = 0;
let prevented = false;

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

if (!formFile) {
  diagnostics.push(`arquivo components/${entityPascal}Form.tsx nao foi gerado`);
} else {
  try {
    const transpiled = ts.transpileModule(formFile.content, {
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

    let currentState: unknown;
    const useState = (initializer: unknown): [unknown, (value: unknown) => void] => {
      currentState = typeof initializer === 'function' ? (initializer as () => unknown)() : initializer;
      stateInitializers.push(currentState);
      return [currentState, (value: unknown) => {
        currentState = typeof value === 'function' ? (value as (previous: unknown) => unknown)(currentState) : value;
        stateUpdates.push(currentState);
      }];
    };

    const material = {
      Button: component('Button'),
      Checkbox: component('Checkbox'),
      FormControlLabel: component('FormControlLabel'),
      MenuItem: component('MenuItem'),
      Stack: component('Stack'),
      TextField: component('TextField')
    };

    const require = (specifier: string): unknown => {
      if (specifier === 'react') return { useState };
      if (specifier === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
      if (specifier === '@mui/material') return material;
      throw new Error(`modulo nao permitido: ${specifier}`);
    };

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, require, console });
    new vm.Script(transpiled.outputText, { filename: formFile.path }).runInContext(context, { timeout: 1000 });

    const exported = module.exports as Record<string, unknown>;
    exportsFound = Object.keys(exported).sort();
    const form = exported[`${entityPascal}Form`];
    if (typeof form !== 'function') {
      diagnostics.push(`export ${entityPascal}Form ausente ou nao executavel`);
    } else {
      const initialValue = Object.fromEntries(
        resolved.fields
          .filter((field) => field.name.toLowerCase() !== 'id')
          .map((field, index) => [field.name.charAt(0).toLowerCase() + field.name.slice(1), index + 1])
      );
      const tree = (form as (props: Record<string, unknown>) => unknown)({
        initialValue,
        isSubmitting: true,
        onSubmit: (input: unknown) => submissions.push(input)
      });

      if (!tree || typeof tree !== 'object') {
        diagnostics.push('componente nao retornou uma arvore JSX valida');
      } else {
        const root = tree as JsxNode;
        rootType = typeof root.type === 'string' ? root.type : typeof root.type === 'function' ? root.type.name : String(root.type);
        walk(root, (node) => {
          nodeCount += 1;
          const typeName = typeof node.type === 'string' ? node.type : typeof node.type === 'function' ? node.type.name : String(node.type);
          if (typeName === 'TextField' || typeName === 'Checkbox' || typeName === 'FormControlLabel') inputCount += 1;
          if (typeName === 'Button' && node.props.type === 'submit') {
            submitButtonCount += 1;
            if (node.props.disabled !== true) diagnostics.push('botao submit nao respeitou isSubmitting=true');
          }
        });

        if (root.props.component !== 'form') diagnostics.push('container raiz nao foi configurado como formulario');
        if (typeof root.props.onSubmit !== 'function') {
          diagnostics.push('formulario nao possui manipulador onSubmit');
        } else {
          (root.props.onSubmit as (event: { preventDefault: () => void }) => void)({ preventDefault: () => { prevented = true; } });
        }
      }
    }

    if (stateInitializers.length !== 1) diagnostics.push(`useState chamado ${stateInitializers.length} vez(es), esperado 1`);
    if (inputCount < resolved.fields.length) diagnostics.push(`foram renderizados ${inputCount} controles para ${resolved.fields.length} campos`);
    if (submitButtonCount !== 1) diagnostics.push(`foram encontrados ${submitButtonCount} botoes submit, esperado 1`);
    if (!prevented) diagnostics.push('onSubmit nao chamou preventDefault');
    if (submissions.length !== 1) diagnostics.push(`onSubmit externo chamado ${submissions.length} vez(es), esperado 1`);
    if (submissions.length === 1 && JSON.stringify(submissions[0]) !== JSON.stringify(stateInitializers[0])) {
      diagnostics.push('onSubmit externo nao recebeu o estado inicial do formulario');
    }
  } catch (error) {
    diagnostics.push(`${formFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const runtimeMarker = diagnostics.length === 0
  ? `FRONTEND_FORM_OK:${entity}:fields=${resolved.fields.length}:nodes=${nodeCount}`
  : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  formFile: formFile?.path ?? null,
  expectedExport: `${entityPascal}Form`,
  exports: exportsFound,
  rootType,
  nodeCount,
  inputCount,
  submitButtonCount,
  stateInitializers: stateInitializers.length,
  stateUpdates: stateUpdates.length,
  submissions: submissions.length,
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao do formulario frontend gerado de ${entity}`);
  console.log(`Arquivo: ${output.formFile ?? 'nao encontrado'}`);
  console.log(`Raiz: ${rootType ?? 'nao identificada'}`);
  console.log(`Campos: ${inputCount}/${resolved.fields.length}`);
  console.log(`Submissoes: ${submissions.length}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
