import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface TabDefinition {
  name?: unknown;
  label?: unknown;
  fieldNames?: unknown;
  confidence?: unknown;
  evidence?: unknown;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-tabs arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const tabsFile = generated.find((file) => file.path.endsWith(`/tabs/${entityCamel}Tabs.ts`));
const diagnostics: string[] = [];
let exportsFound: string[] = [];
let tabCount = 0;
let fieldReferences = 0;
let uniqueNames = 0;
let uniqueFields = 0;

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

function executeCommonJs(code: string, filename: string): Record<string, unknown> {
  const module = { exports: {} as Record<string, unknown> };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: (specifier: string) => { throw new Error(`modulo nao permitido nas abas: ${specifier}`); },
    console
  });
  new vm.Script(code, { filename }).runInContext(context, { timeout: 1000 });
  return module.exports;
}

if (!tabsFile) {
  diagnostics.push(`arquivo tabs/${entityCamel}Tabs.ts nao foi gerado`);
} else {
  try {
    const moduleExports = executeCommonJs(transpile(tabsFile), tabsFile.path);
    exportsFound = Object.keys(moduleExports);
    const tabs = moduleExports[`${entityCamel}Tabs`];

    if (!Array.isArray(tabs)) {
      diagnostics.push(`export ${entityCamel}Tabs ausente ou nao e array`);
    } else {
      tabCount = tabs.length;
      if (tabCount !== resolved.tabs.length) diagnostics.push(`foram geradas ${tabCount} abas para ${resolved.tabs.length} abas inferidas`);

      const names = new Set<string>();
      const referencedFields = new Set<string>();
      const knownFields = new Set(resolved.fields.map((field) => field.name));

      tabs.forEach((value: unknown, index: number) => {
        if (!value || typeof value !== 'object') {
          diagnostics.push(`aba ${index} nao e objeto`);
          return;
        }

        const tab = value as TabDefinition;
        if (typeof tab.name !== 'string' || !tab.name.trim()) diagnostics.push(`aba ${index} possui name invalido`);
        else {
          if (names.has(tab.name)) diagnostics.push(`nome de aba duplicado: ${tab.name}`);
          names.add(tab.name);
        }
        if (typeof tab.label !== 'string' || !tab.label.trim()) diagnostics.push(`aba ${index} possui label invalido`);
        if (!Array.isArray(tab.fieldNames)) {
          diagnostics.push(`aba ${index} possui fieldNames invalido`);
        } else {
          for (const fieldName of tab.fieldNames) {
            if (typeof fieldName !== 'string' || !fieldName.trim()) {
              diagnostics.push(`aba ${index} possui referencia de campo invalida`);
              continue;
            }
            fieldReferences += 1;
            referencedFields.add(fieldName);
            if (!knownFields.has(fieldName)) diagnostics.push(`aba ${String(tab.name ?? index)} referencia campo inexistente: ${fieldName}`);
          }
        }
        if (!['high', 'medium', 'low'].includes(String(tab.confidence))) diagnostics.push(`aba ${index} possui confidence invalido`);
        if (typeof tab.evidence !== 'string' || !tab.evidence.trim()) diagnostics.push(`aba ${index} possui evidence invalido`);
      });

      uniqueNames = names.size;
      uniqueFields = referencedFields.size;
      for (const inferred of resolved.tabs) {
        const generatedTab = tabs.find((tab: TabDefinition) => tab?.name === inferred.name) as TabDefinition | undefined;
        if (!generatedTab) {
          diagnostics.push(`aba inferida nao foi gerada: ${inferred.name}`);
          continue;
        }
        const generatedFields = Array.isArray(generatedTab.fieldNames) ? generatedTab.fieldNames : [];
        if (JSON.stringify(generatedFields) !== JSON.stringify(inferred.fieldNames)) diagnostics.push(`campos divergentes na aba ${inferred.name}`);
        if (generatedTab.label !== inferred.label) diagnostics.push(`label divergente na aba ${inferred.name}`);
        if (generatedTab.confidence !== inferred.confidence) diagnostics.push(`confidence divergente na aba ${inferred.name}`);
        if (generatedTab.evidence !== inferred.evidence) diagnostics.push(`evidence divergente na aba ${inferred.name}`);
      }
    }
  } catch (error) {
    diagnostics.push(error instanceof Error ? error.message : String(error));
  }
}

const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_TABS_OK:${entity}:tabs=${tabCount}:fields=${fieldReferences}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  tabsFile: tabsFile?.path ?? null,
  expectedExport: `${entityCamel}Tabs`,
  exports: exportsFound,
  inferredTabs: resolved.tabs.length,
  tabCount,
  fieldReferences,
  uniqueNames,
  uniqueFields,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log('Validacao dinamica das abas frontend geradas');
  console.log(`Entidade: ${entity}`);
  console.log(`Abas: ${tabCount}/${resolved.tabs.length}`);
  console.log(`Referencias de campos: ${fieldReferences}`);
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(`[ERRO] ${diagnostic}`);
}

if (!ok) process.exit(1);
