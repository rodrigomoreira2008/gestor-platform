import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface ContractField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'unknown';
  optional: boolean;
}

interface ContractIssue {
  kind: 'missing-backend' | 'missing-frontend' | 'type-mismatch' | 'identity-mismatch';
  field: string;
  backend?: ContractField;
  frontend?: ContractField;
  message: string;
}

const args = process.argv.slice(2);
const json = args.includes('--json');
const positional = args.filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = positional;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:contracts arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const backendFiles = generateBackendFiles(resolved);
const frontendFiles = generateFrontendFiles(resolved);
const dtoFile = backendFiles.find((file) => file.path.endsWith(`/${entity}Dto.cs`));
const typesFile = frontendFiles.find((file) => file.path.endsWith(`/types/${toCamelCase(entity)}.ts`));

if (!dtoFile || !typesFile) {
  console.error(JSON.stringify({
    missingDto: !dtoFile,
    missingTypes: !typesFile,
    backendPaths: backendFiles.map((file) => file.path),
    frontendPaths: frontendFiles.map((file) => file.path)
  }, null, 2));
  process.exit(1);
}

const backendFields = parseCSharpProperties(dtoFile.content);
const frontendFields = parseTypeScriptInterface(typesFile.content, entity);
const backendByName = new Map(backendFields.map((field) => [normalizeName(field.name), field]));
const frontendByName = new Map(frontendFields.map((field) => [normalizeName(field.name), field]));
const allNames = [...new Set([...backendByName.keys(), ...frontendByName.keys()])].sort();
const issues: ContractIssue[] = [];

for (const name of allNames) {
  const backend = backendByName.get(name);
  const frontend = frontendByName.get(name);
  if (!backend) {
    issues.push({ kind: 'missing-backend', field: frontend?.name ?? name, frontend, message: 'Campo existe apenas no contrato frontend.' });
    continue;
  }
  if (!frontend) {
    issues.push({ kind: 'missing-frontend', field: backend.name, backend, message: 'Campo existe apenas no DTO backend.' });
    continue;
  }
  if (backend.type !== frontend.type && backend.type !== 'unknown' && frontend.type !== 'unknown') {
    issues.push({ kind: 'type-mismatch', field: frontend.name, backend, frontend, message: `Tipos incompatíveis: backend=${backend.type}, frontend=${frontend.type}.` });
  }
}

const backendId = backendByName.get('id');
const frontendId = frontendByName.get('id');
if (!backendId || !frontendId || backendId.type !== 'number' || frontendId.type !== 'number') {
  issues.push({ kind: 'identity-mismatch', field: 'id', backend: backendId, frontend: frontendId, message: 'A identidade deve existir como número nos dois contratos.' });
}

const output = {
  ok: issues.length === 0,
  entity,
  dtoPath: dtoFile.path,
  typesPath: typesFile.path,
  backendFields,
  frontendFields,
  checkedFields: allNames.length,
  issues
};

if (json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Validação de contrato backend/frontend de ${entity}`);
  console.log(`DTO: ${dtoFile.path}`);
  console.log(`Types: ${typesFile.path}`);
  console.log(`Campos verificados: ${allNames.length}`);
  for (const issue of issues) console.error(`[${issue.kind}] ${issue.field}: ${issue.message}`);
  console.log(issues.length === 0 ? 'Resultado: OK' : `Resultado: ${issues.length} divergência(s)`);
}

if (issues.length > 0) process.exit(1);

function parseCSharpProperties(content: string): ContractField[] {
  const matches = [...content.matchAll(/public\s+([A-Za-z0-9_?<>]+)\s+([A-Za-z0-9_]+)\s*\{\s*get;\s*set;\s*\}/g)];
  return matches.map((match) => ({
    name: match[2] ?? '',
    type: mapCSharpType(match[1] ?? ''),
    optional: (match[1] ?? '').endsWith('?')
  }));
}

function parseTypeScriptInterface(content: string, entityName: string): ContractField[] {
  const interfaceMatch = content.match(new RegExp(`export\\s+interface\\s+${escapeRegExp(entityName)}\\s*\\{([\\s\\S]*?)\\}`));
  if (!interfaceMatch?.[1]) return [];
  return [...interfaceMatch[1].matchAll(/^\s*([A-Za-z0-9_]+)(\?)?:\s*([^;]+);/gm)].map((match) => ({
    name: match[1] ?? '',
    type: mapTypeScriptType(match[3] ?? ''),
    optional: Boolean(match[2]) || /undefined|null/.test(match[3] ?? '')
  }));
}

function mapCSharpType(type: string): ContractField['type'] {
  const normalized = type.replace(/\?/g, '').toLowerCase();
  if (['int', 'long', 'short', 'decimal', 'double', 'float'].includes(normalized)) return 'number';
  if (['datetime', 'dateonly'].includes(normalized)) return 'date';
  if (normalized === 'bool') return 'boolean';
  if (normalized === 'string') return 'string';
  return 'unknown';
}

function mapTypeScriptType(type: string): ContractField['type'] {
  const normalized = type.replace(/\s+/g, '').toLowerCase();
  if (normalized.includes('number')) return 'number';
  if (normalized.includes('boolean')) return 'boolean';
  if (normalized.includes('date')) return 'date';
  if (normalized.includes('string')) return 'string';
  return 'unknown';
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function toCamelCase(value: string): string {
  const pascal = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
