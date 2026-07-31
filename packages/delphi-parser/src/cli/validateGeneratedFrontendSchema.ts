import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface SchemaOperation { kind: string; args: unknown[]; }
interface SchemaNode { kind: string; operations: SchemaOperation[]; shape?: Record<string, SchemaNode>; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-schema arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const schemaFile = generated.find((file) => file.path.endsWith('/schema.ts'));
const diagnostics: string[] = [];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const expectedExport = `${entityCamel}Schema`;
let exportsFound: string[] = [];
let fieldCount = 0;
let operationCount = 0;

const createNode = (kind: string): SchemaNode & Record<string, unknown> => {
  const node: SchemaNode & Record<string, unknown> = { kind, operations: [] };
  const chain = ['optional', 'trim', 'min', 'max', 'email', 'refine'];
  for (const method of chain) {
    node[method] = (...methodArgs: unknown[]) => {
      node.operations.push({ kind: method, args: methodArgs.map((value) => typeof value === 'function' ? '[function]' : value) });
      return node;
    };
  }
  return node;
};

if (!schemaFile) {
  diagnostics.push('arquivo schema.ts nao foi gerado');
} else {
  try {
    const source = schemaFile.content
      .replace(/import\s+\{\s*z\s*\}\s+from\s+['"]zod['"];?/, 'const { z } = require("virtual:zod");')
      .replace(/^export\s+type\s+[^;]+;?\s*$/gm, '');

    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        esModuleInterop: true
      },
      fileName: schemaFile.path,
      reportDiagnostics: true
    });

    for (const diagnostic of transpiled.diagnostics ?? []) {
      diagnostics.push(`${schemaFile.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }

    const z = {
      string: () => createNode('string'),
      boolean: () => createNode('boolean'),
      coerce: { number: (...numberArgs: unknown[]) => {
        const node = createNode('number');
        node.operations.push({ kind: 'coerce', args: numberArgs });
        return node;
      } },
      preprocess: (processor: unknown, schema: SchemaNode) => {
        const node = createNode('preprocess');
        node.operations.push({ kind: 'processor', args: [typeof processor === 'function' ? '[function]' : processor] });
        node.operations.push({ kind: 'inner', args: [schema.kind] });
        return node;
      },
      object: (shape: Record<string, SchemaNode>) => ({ kind: 'object', operations: [], shape })
    };

    const require = (specifier: string): unknown => {
      if (specifier === 'virtual:zod') return { z };
      throw new Error(`modulo nao permitido: ${specifier}`);
    };

    const module = { exports: {} as Record<string, unknown> };
    const context = vm.createContext({ module, exports: module.exports, require, console });
    new vm.Script(transpiled.outputText, { filename: schemaFile.path }).runInContext(context, { timeout: 1000 });

    const exported = module.exports as Record<string, unknown>;
    exportsFound = Object.keys(exported).sort();
    const schema = exported[expectedExport] as SchemaNode | undefined;
    if (!schema || schema.kind !== 'object' || !schema.shape) {
      diagnostics.push(`export ${expectedExport} ausente ou nao representa um schema de objeto`);
    } else {
      const fields = Object.entries(schema.shape);
      fieldCount = fields.length;
      if (fieldCount === 0) diagnostics.push('schema gerado sem campos');
      if (fields.some(([name]) => name.toLowerCase() === 'id')) diagnostics.push('schema de formulario incluiu o campo de identidade id');
      for (const [name, node] of fields) {
        if (!name || !/^[a-z][A-Za-z0-9]*$/.test(name)) diagnostics.push(`campo fora de camelCase: ${name}`);
        if (!node || typeof node.kind !== 'string') diagnostics.push(`campo ${name} possui schema invalido`);
        operationCount += node.operations?.length ?? 0;
      }
    }
  } catch (error) {
    diagnostics.push(`${schemaFile.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const runtimeMarker = diagnostics.length === 0 ? `FRONTEND_SCHEMA_OK:${entity}:fields=${fieldCount}:operations=${operationCount}` : null;
const output = {
  ok: diagnostics.length === 0,
  entity,
  generatedFiles: generated.length,
  schemaFile: schemaFile?.path ?? null,
  expectedExport,
  exports: exportsFound,
  fieldCount,
  operationCount,
  runtimeMarker,
  diagnostics: diagnostics.slice(0, 50)
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao do schema frontend gerado de ${entity}`);
  console.log(`Arquivo: ${output.schemaFile ?? 'nao encontrado'}`);
  console.log(`Export esperado: ${expectedExport}`);
  console.log(`Campos: ${fieldCount}`);
  console.log(`Operacoes de validacao: ${operationCount}`);
  for (const diagnostic of output.diagnostics) console.error(`[ERRO] ${diagnostic}`);
  if (runtimeMarker) console.log(runtimeMarker);
  console.log(output.ok ? 'Resultado: OK' : 'Resultado: FALHOU');
}

if (!output.ok) process.exit(1);
