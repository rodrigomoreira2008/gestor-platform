import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-types arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityCamel = entity.charAt(0).toLowerCase() + entity.slice(1);
const typesFile = generated.find((file) => file.path.endsWith(`/types/${entityCamel}.ts`));
const diagnostics: string[] = [];
let interfaceFields = 0;
let optionalFields = 0;
let inputAliasFound = false;
let idType = '';

if (!typesFile) {
  diagnostics.push(`arquivo types/${entityCamel}.ts nao foi gerado`);
} else {
  const source = ts.createSourceFile(typesFile.path, typesFile.content, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const parseDiagnostics = source.parseDiagnostics ?? [];
  for (const diagnostic of parseDiagnostics) {
    diagnostics.push(`TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
  }

  const interfaceDeclaration = source.statements.find(
    (statement): statement is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(statement) && statement.name.text === entity
  );

  if (!interfaceDeclaration) {
    diagnostics.push(`interface ${entity} ausente`);
  } else {
    const properties = interfaceDeclaration.members.filter(ts.isPropertySignature);
    const id = properties.find((property) => property.name.getText(source) === 'id');
    if (!id) diagnostics.push('propriedade id ausente');
    else {
      idType = id.type?.getText(source) ?? '';
      if (idType !== 'number') diagnostics.push(`id deve ser number, encontrado ${idType || 'sem tipo'}`);
      if (id.questionToken) diagnostics.push('id nao pode ser opcional');
    }

    const dataProperties = properties.filter((property) => property.name.getText(source) !== 'id');
    interfaceFields = dataProperties.length;
    optionalFields = dataProperties.filter((property) => Boolean(property.questionToken)).length;

    if (interfaceFields !== resolved.fields.length) {
      diagnostics.push(`interface possui ${interfaceFields} campos para ${resolved.fields.length} campos resolvidos`);
    }

    const expectedNames = resolved.fields.map((field) => toCamelCase(field.name));
    const generatedNames = dataProperties.map((property) => property.name.getText(source));
    for (let index = 0; index < expectedNames.length; index += 1) {
      if (generatedNames[index] !== expectedNames[index]) {
        diagnostics.push(`campo ${index + 1}: esperado ${expectedNames[index]}, encontrado ${generatedNames[index] ?? 'ausente'}`);
      }
    }

    for (const property of dataProperties) {
      if (!property.questionToken) diagnostics.push(`campo ${property.name.getText(source)} deve ser opcional`);
      const typeText = property.type?.getText(source) ?? '';
      if (!['string', 'number', 'boolean'].includes(typeText)) {
        diagnostics.push(`campo ${property.name.getText(source)} possui tipo nao suportado: ${typeText || 'ausente'}`);
      }
    }
  }

  const alias = source.statements.find(
    (statement): statement is ts.TypeAliasDeclaration => ts.isTypeAliasDeclaration(statement) && statement.name.text === `${entity}Input`
  );
  if (!alias) {
    diagnostics.push(`alias ${entity}Input ausente`);
  } else {
    inputAliasFound = true;
    const aliasText = alias.type.getText(source).replace(/\s+/g, '');
    const expected = `Omit<${entity},'id'>`;
    if (aliasText !== expected) diagnostics.push(`${entity}Input deve ser ${expected}, encontrado ${aliasText}`);
  }

  const runtimeStatements = source.statements.filter(
    (statement) => !ts.isInterfaceDeclaration(statement) && !ts.isTypeAliasDeclaration(statement) && !ts.isImportDeclaration(statement)
  );
  if (runtimeStatements.length > 0) diagnostics.push('arquivo de tipos contem declaracoes de runtime inesperadas');
}

const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_TYPES_OK:${entity}:fields=${interfaceFields}:optional=${optionalFields}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  typesFile: typesFile?.path ?? null,
  interfaceFields,
  optionalFields,
  idType: idType || null,
  inputAliasFound,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(diagnostic);
}

if (!ok) process.exit(1);

function toCamelCase(value: string): string {
  const pascal = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
