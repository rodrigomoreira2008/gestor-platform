import { readFileSync } from 'node:fs';
import { generateBackendFiles, resolveDelphiForm } from '../index';

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:repository arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const files = generateBackendFiles(resolved);
const bySuffix = (suffix: string) => files.find((file) => file.path.endsWith(suffix));
const entityName = toPascalCase(entity);

const entityFile = bySuffix(`/Entities/${entityName}.cs`);
const dtoFile = bySuffix(`/DTO/${entityName}Dto.cs`);
const validatorFile = bySuffix(`/Validators/${entityName}Validator.cs`);
const serviceFile = bySuffix(`/Services/${entityName}Service.cs`);
const controllerFile = bySuffix(`/Controllers/${entityName}Controller.cs`);
const configurationFile = bySuffix(`/Configurations/${entityName}Configuration.cs`);
const registrationFile = bySuffix(`/Generated/${entityName}DbContextRegistration.cs.txt`);

const checks: Check[] = [];
for (const [name, file] of [
  ['entidade', entityFile],
  ['DTO', dtoFile],
  ['validator', validatorFile],
  ['service', serviceFile],
  ['controller', controllerFile],
  ['configuration', configurationFile],
  ['registro DbContext', registrationFile]
] as const) {
  checks.push({ name: `${name} gerado`, ok: Boolean(file), detail: file?.path ?? 'arquivo ausente' });
}

if (entityFile && dtoFile && validatorFile && serviceFile && controllerFile && configurationFile && registrationFile) {
  const entityProperties = extractCSharpProperties(entityFile.content);
  const dtoProperties = extractCSharpProperties(dtoFile.content);
  const configuredProperties = extractConfiguredProperties(configurationFile.content);
  const serviceAssignments = extractServiceAssignments(serviceFile.content);

  checks.push(checkIncludes(serviceFile.content, `CrudService<${entityName}, ${entityName}Dto>`, 'service usa entidade e DTO corretos'));
  checks.push(checkIncludes(validatorFile.content, `IValidator<${entityName}Dto>`, 'validator usa DTO correto'));
  checks.push(checkIncludes(controllerFile.content, `CrudControllerBase<${entityName}, ${entityName}Dto, ${entityName}Service>`, 'controller usa contratos corretos'));
  checks.push(checkIncludes(configurationFile.content, `IEntityTypeConfiguration<${entityName}>`, 'configuration usa entidade correta'));
  checks.push(checkIncludes(registrationFile.content, `DbSet<${entityName}>`, 'registro declara DbSet correto'));
  checks.push(checkIncludes(registrationFile.content, `new ${entityName}Configuration()`, 'registro aplica configuration correta'));

  const entityNames = new Set(entityProperties.map((property) => property.name));
  const dtoNames = new Set(dtoProperties.map((property) => property.name));
  const missingInDto = [...entityNames].filter((name) => !dtoNames.has(name));
  const missingInEntity = [...dtoNames].filter((name) => !entityNames.has(name));
  checks.push({ name: 'Entity e DTO possuem as mesmas propriedades escalares', ok: missingInDto.length === 0 && missingInEntity.length === 0, detail: `ausentes no DTO=[${missingInDto.join(', ')}], ausentes na Entity=[${missingInEntity.join(', ')}]` });

  const typeMismatches = entityProperties
    .filter((property) => dtoNames.has(property.name))
    .filter((property) => dtoProperties.find((candidate) => candidate.name === property.name)?.type !== property.type)
    .map((property) => `${property.name}:${property.type}/${dtoProperties.find((candidate) => candidate.name === property.name)?.type}`);
  checks.push({ name: 'Entity e DTO possuem tipos compatíveis', ok: typeMismatches.length === 0, detail: typeMismatches.join(', ') || 'sem divergências' });

  const configurableNames = [...entityNames].filter((name) => name !== 'Id');
  const missingConfiguration = configurableNames.filter((name) => !configuredProperties.has(name));
  checks.push({ name: 'campos da entidade possuem mapeamento de coluna', ok: missingConfiguration.length === 0, detail: missingConfiguration.join(', ') || 'todos mapeados' });

  const missingServiceMappings = [...dtoNames].filter((name) => !serviceAssignments.has(name));
  checks.push({ name: 'service mapeia todas as propriedades do DTO', ok: missingServiceMappings.length === 0, detail: missingServiceMappings.join(', ') || 'todos mapeados' });

  const duplicateEntity = duplicates(entityProperties.map((property) => property.name));
  const duplicateDto = duplicates(dtoProperties.map((property) => property.name));
  checks.push({ name: 'sem propriedades duplicadas', ok: duplicateEntity.length === 0 && duplicateDto.length === 0, detail: `Entity=[${duplicateEntity.join(', ')}], DTO=[${duplicateDto.join(', ')}]` });
}

const failed = checks.filter((check) => !check.ok);
const output = { ok: failed.length === 0, entity, files: files.length, total: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed.map((check) => check.name), checks };

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log(`Validacao da camada de persistencia gerada para ${entity}`);
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  console.log(`Resumo: ${output.passed}/${output.total} verificacoes OK`);
}

if (failed.length > 0) process.exit(1);

function checkIncludes(content: string, fragment: string, name: string): Check {
  return { name, ok: content.includes(fragment), detail: fragment };
}

function extractCSharpProperties(content: string): Array<{ name: string; type: string }> {
  return [...content.matchAll(/public\s+([A-Za-z0-9_?<>]+)\s+([A-Za-z0-9_]+)\s*\{\s*get;\s*set;\s*\}/g)]
    .map((match) => ({ type: match[1]!, name: match[2]! }))
    .filter((property) => !property.type.endsWith('Service') && !property.type.endsWith('Configuration'));
}

function extractConfiguredProperties(content: string): Set<string> {
  return new Set([...content.matchAll(/builder\.Property\(entity\s*=>\s*entity\.([A-Za-z0-9_]+)\)/g)].map((match) => match[1]!));
}

function extractServiceAssignments(content: string): Set<string> {
  return new Set([...content.matchAll(/^\s*([A-Za-z0-9_]+)\s*=\s*(?:entity|input)\.[A-Za-z0-9_]+/gm)].map((match) => match[1]!));
}

function duplicates(values: string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}
