import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface JsxNode { type: unknown; props: Record<string, unknown>; }
interface LookupCall { hook: string; enabled: boolean; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-lookup arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const lookupFile = generated.find((file) => file.path.endsWith(`/components/${entityPascal}LookupField.tsx`));
const diagnostics: string[] = [];
const hookCalls: LookupCall[] = [];
const changes: unknown[] = [];
let exportsFound: string[] = [];
let autocompleteCount = 0;
let fallbackCount = 0;
let renderInputCount = 0;
let loadingIndicators = 0;

const jsx = (type: unknown, props: Record<string, unknown> | null, key?: unknown): JsxNode => ({
  type,
  props: { ...(props ?? {}), ...(key === undefined ? {} : { key }) }
});

function component(name: string): (props: Record<string, unknown>) => JsxNode {
  const fn = (props: Record<string, unknown>) => jsx(name, props);
  Object.defineProperty(fn, 'name', { value: name });
  return fn;
}

function typeName(type: unknown): string {
  if (typeof type === 'string') return type;
  if (typeof type === 'function') return type.name || 'anonymous';
  return String(type);
}

if (!lookupFile) {
  diagnostics.push(`arquivo components/${entityPascal}LookupField.tsx nao foi gerado`);
} else {
  try {
    const transpiled = ts.transpileModule(lookupFile.content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        strict: true,
        esModuleInterop: true
      },
      fileName: lookupFile.path,
      reportDiagnostics: true
    });

    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${lookupFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const material = {
      Alert: component('Alert'),
      Autocomplete: component('Autocomplete'),
      CircularProgress: component('CircularProgress'),
      TextField: component('TextField')
    };

    const hookModule: Record<string, unknown> = {};
    for (const lookup of resolved.lookups) {
      const pascal = lookup.fieldName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
      const hookName = `use${pascal}Lookup`;
      hookModule[hookName] = (enabled: boolean) => {
        hookCalls.push({ hook: hookName, enabled });
        return {
          data: [{ id: 7, label: `${lookup.fieldName} sete` }, { id: '8', label: `${lookup.fieldName} oito` }],
          isLoading: true,
          isFetching: false,
          isError: false,
          error: null
        };
      };
    }

    const require = (specifier: string): unknown => {
      if (specifier === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
      if (specifier === '@mui/material') return material;
      if (specifier.endsWith(`/lookups/${entity}LookupHooks`) || specifier.endsWith(`../lookups/${entity}LookupHooks`)) return hookModule;
      throw new Error(`modulo nao permitido: ${specifier}`);
    };

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, require, console });
    new vm.Script(transpiled.outputText, { filename: lookupFile.path }).runInContext(context, { timeout: 1000 });

    const exported = module.exports as Record<string, unknown>;
    exportsFound = Object.keys(exported).sort();
    const lookupField = exported[`${entityPascal}LookupField`];
    if (typeof lookupField !== 'function') {
      diagnostics.push(`export ${entityPascal}LookupField ausente ou nao executavel`);
    } else {
      for (const lookup of resolved.lookups) {
        const outer = (lookupField as (props: Record<string, unknown>) => JsxNode)({
          fieldName: lookup.fieldName,
          label: lookup.fieldName,
          value: '7',
          required: true,
          disabled: false,
          onChange: (value: unknown) => changes.push(value)
        });

        if (!outer || typeof outer !== 'object' || typeof outer.type !== 'function') {
          diagnostics.push(`lookup ${lookup.fieldName} nao retornou o componente interno esperado`);
          continue;
        }

        const rendered = (outer.type as (props: Record<string, unknown>) => JsxNode)(outer.props);
        if (typeName(rendered.type) !== 'Autocomplete') {
          diagnostics.push(`lookup ${lookup.fieldName} nao renderizou Autocomplete`);
          continue;
        }
        autocompleteCount += 1;

        const options = rendered.props.options as Array<{ id: unknown; label: string }>;
        if (!Array.isArray(options) || options.length !== 2) diagnostics.push(`lookup ${lookup.fieldName} nao recebeu as opcoes do hook`);
        const selected = rendered.props.value as { id?: unknown } | null;
        if (!selected || String(selected.id) !== '7') diagnostics.push(`lookup ${lookup.fieldName} nao selecionou valor equivalente por string`);
        if (rendered.props.loading !== true) diagnostics.push(`lookup ${lookup.fieldName} nao refletiu estado de carregamento`);
        if (typeof rendered.props.getOptionLabel !== 'function' || (rendered.props.getOptionLabel as (option: { label: string }) => string)({ label: 'Teste' }) !== 'Teste') {
          diagnostics.push(`lookup ${lookup.fieldName} possui getOptionLabel invalido`);
        }
        if (typeof rendered.props.onChange === 'function') {
          (rendered.props.onChange as (event: unknown, option: { id: unknown } | null) => void)(null, { id: 8 });
        } else diagnostics.push(`lookup ${lookup.fieldName} nao possui onChange`);

        if (typeof rendered.props.renderInput === 'function') {
          const input = (rendered.props.renderInput as (params: Record<string, unknown>) => JsxNode)({ InputProps: { endAdornment: 'original' } });
          renderInputCount += 1;
          if (typeName(input.type) !== 'TextField') diagnostics.push(`lookup ${lookup.fieldName} nao renderizou TextField de entrada`);
          const inputProps = input.props.InputProps as Record<string, unknown> | undefined;
          const adornment = inputProps?.endAdornment as JsxNode | undefined;
          if (adornment && typeof adornment === 'object') {
            const children = adornment.props?.children;
            const list = Array.isArray(children) ? children.flat(Infinity) : [children];
            if (list.some((child) => child && typeof child === 'object' && typeName((child as JsxNode).type) === 'CircularProgress')) loadingIndicators += 1;
          }
        } else diagnostics.push(`lookup ${lookup.fieldName} nao possui renderInput`);
      }

      const fallback = (lookupField as (props: Record<string, unknown>) => JsxNode)({
        fieldName: '__nao_inferido__',
        label: 'Nao inferido',
        value: '',
        onChange: () => undefined
      });
      if (typeName(fallback.type) === 'TextField' && fallback.props.disabled === true) fallbackCount += 1;
      else diagnostics.push('fallback de lookup nao inferido nao renderizou TextField desabilitado');
    }

    if (hookCalls.length !== resolved.lookups.length) diagnostics.push(`hooks de lookup chamados ${hookCalls.length} vez(es), esperado ${resolved.lookups.length}`);
    if (hookCalls.some((call) => call.enabled !== true)) diagnostics.push('algum hook de lookup nao foi habilitado para campo ativo');
    if (autocompleteCount !== resolved.lookups.length) diagnostics.push(`Autocompletes renderizados ${autocompleteCount}, esperado ${resolved.lookups.length}`);
    if (changes.length !== resolved.lookups.length || changes.some((value) => value !== 8)) diagnostics.push('onChange dos lookups nao encaminhou os identificadores selecionados');
    if (renderInputCount !== resolved.lookups.length) diagnostics.push(`renderInput executado ${renderInputCount} vez(es), esperado ${resolved.lookups.length}`);
    if (loadingIndicators !== resolved.lookups.length) diagnostics.push(`indicadores de carregamento ${loadingIndicators}, esperado ${resolved.lookups.length}`);
    if (fallbackCount !== 1) diagnostics.push('fallback de lookup deveria ser validado exatamente uma vez');
  } catch (error) {
    diagnostics.push(`${lookupFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const runtimeMarker = diagnostics.length === 0
  ? `FRONTEND_LOOKUP_OK:${entity}:lookups=${resolved.lookups.length}:autocomplete=${autocompleteCount}`
  : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  lookupFile: lookupFile?.path ?? null,
  expectedExport: `${entityPascal}LookupField`,
  exports: exportsFound,
  inferredLookups: resolved.lookups.length,
  hookCalls: hookCalls.length,
  autocompleteCount,
  fallbackCount,
  renderInputCount,
  loadingIndicators,
  changes: changes.length,
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao do componente de lookup frontend gerado de ${entity}`);
  console.log(`Arquivo: ${output.lookupFile ?? 'nao encontrado'}`);
  console.log(`Lookups inferidos: ${output.inferredLookups}`);
  console.log(`Autocompletes: ${autocompleteCount}`);
  console.log(`Fallbacks: ${fallbackCount}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
