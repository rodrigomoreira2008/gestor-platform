import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface GridColumn { field?: unknown; headerName?: unknown; width?: unknown; flex?: unknown; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-columns arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const columnsFile = generated.find((file) => file.path.endsWith(`/table/${entityCamel}Columns.ts`));
const diagnostics: string[] = [];
let exportsFound: string[] = [];
let columnCount = 0;
let dataColumnCount = 0;
let runtimeMarker: string | null = null;

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

if (!columnsFile) {
  diagnostics.push(`arquivo table/${entityCamel}Columns.ts nao foi gerado`);
} else {
  try {
    const transpiled = ts.transpileModule(columnsFile.content, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, strict: true, esModuleInterop: true },
      fileName: columnsFile.path,
      reportDiagnostics: true
    });
    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${columnsFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({
      module,
      exports: module.exports,
      console,
      require: (specifier: string) => { throw new Error(`modulo nao permitido: ${specifier}`); }
    });
    new vm.Script(transpiled.outputText, { filename: columnsFile.path }).runInContext(context, { timeout: 1000 });
    exportsFound = Object.keys(module.exports);

    const columns = module.exports[`${entityCamel}Columns`];
    if (!Array.isArray(columns)) {
      diagnostics.push(`export ${entityCamel}Columns ausente ou nao e array`);
    } else {
      columnCount = columns.length;
      const typed = columns as GridColumn[];
      const expectedFields = resolved.fields.slice(0, 8).map((field) => toCamelCase(field.name));
      const actualFields = typed.map((column) => String(column.field ?? ''));

      if (typed.length !== expectedFields.length + 1) diagnostics.push(`quantidade de colunas ${typed.length} difere do esperado ${expectedFields.length + 1}`);
      if (actualFields[0] !== 'id') diagnostics.push('primeira coluna deve ser id');
      if (new Set(actualFields).size !== actualFields.length) diagnostics.push('existem campos de coluna duplicados');
      if (typed[0]?.headerName !== 'ID') diagnostics.push('cabecalho da coluna id deve ser ID');
      if (typed[0]?.width !== 90) diagnostics.push('largura da coluna id deve ser 90');

      const dataColumns = typed.slice(1);
      dataColumnCount = dataColumns.length;
      dataColumns.forEach((column, index) => {
        const expectedField = expectedFields[index];
        const expectedHeader = resolved.fields[index]?.label ?? resolved.fields[index]?.name;
        if (column.field !== expectedField) diagnostics.push(`coluna ${index + 1} usa campo ${String(column.field)}; esperado ${expectedField}`);
        if (column.headerName !== expectedHeader) diagnostics.push(`coluna ${expectedField} usa cabecalho ${String(column.headerName)}; esperado ${expectedHeader}`);
        if (column.flex !== 1) diagnostics.push(`coluna ${expectedField} deve usar flex 1`);
      });

      if (diagnostics.length === 0) runtimeMarker = `FRONTEND_COLUMNS_OK:${entity}:columns=${columnCount}:data=${dataColumnCount}`;
    }
  } catch (error) {
    diagnostics.push(error instanceof Error ? error.stack ?? error.message : String(error));
  }
}

const report = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  columnsFile: columnsFile?.path ?? null,
  expectedExport: `${entityCamel}Columns`,
  exports: exportsFound,
  columnCount,
  dataColumnCount,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(diagnostic);
}

if (diagnostics.length > 0) process.exit(1);
