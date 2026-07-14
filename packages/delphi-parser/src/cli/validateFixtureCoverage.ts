import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { resolveDelphiForm } from '../index';

interface CoverageCheck {
  name: string;
  ok: boolean;
  detail: string;
}

const packageRoot = process.cwd();
const fixturesRoot = resolve(packageRoot, 'fixtures');
const checks: CoverageCheck[] = [];

if (!existsSync(fixturesRoot)) {
  console.error(`Diretorio de fixtures nao encontrado: ${fixturesRoot}`);
  process.exit(1);
}

const dfmFiles = readdirSync(fixturesRoot)
  .filter((file) => extname(file).toLowerCase() === '.dfm')
  .sort();

const resolvedFixtures = dfmFiles.flatMap((dfmFile) => {
  const baseName = basename(dfmFile, '.dfm');
  const pasPath = resolve(fixturesRoot, `${baseName}.pas`);
  if (!existsSync(pasPath)) return [];

  const entity = baseName
    .replace(/^cadastro-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  const table = entity.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

  const resolved = resolveDelphiForm(
    readFileSync(resolve(fixturesRoot, dfmFile), 'utf8'),
    readFileSync(pasPath, 'utf8'),
    { entity, table }
  );

  return [{ baseName, resolved }];
});

const fixtureNames = resolvedFixtures.map((item) => item.baseName);
const allFields = resolvedFixtures.flatMap((item) => item.resolved.fields);
const allLookups = resolvedFixtures.flatMap((item) => item.resolved.lookups);
const allTabs = resolvedFixtures.flatMap((item) => item.resolved.tabs);
const allDetails = resolvedFixtures.flatMap((item) => item.resolved.detailGrids);
const allRelationships = resolvedFixtures.flatMap((item) => item.resolved.relationships);
const allValidations = resolvedFixtures.flatMap((item) => item.resolved.validations);

function add(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail });
}

add('ao menos cinco fixtures resolvidos', resolvedFixtures.length >= 5, `${resolvedFixtures.length}: ${fixtureNames.join(', ')}`);
add('cenario CRUD simples coberto', resolvedFixtures.some((item) => item.resolved.detailGrids.length === 0 && item.resolved.fields.length > 0), 'fixture sem grid detalhe');
add('cenario com abas coberto', allTabs.length > 0, `${allTabs.length} aba(s)`);
add('cenario com multiplas abas coberto', resolvedFixtures.some((item) => item.resolved.tabs.length >= 2), 'fixture com duas ou mais abas');
add('lookup coberto', allLookups.length > 0, `${allLookups.length} lookup(s)`);
add('lookup de alta confianca coberto', allLookups.some((lookup) => lookup.confidence === 'high'), allLookups.map((lookup) => `${lookup.fieldName}:${lookup.confidence}`).join(', ') || 'nenhum');
add('grid detalhe coberto', allDetails.length > 0, `${allDetails.length} grid(s)`);
add('relacionamento SQL coberto', allRelationships.length > 0, `${allRelationships.length} relacionamento(s)`);
add('FK direcionada coberta', allRelationships.some((relationship) => Boolean(relationship.dependentTable && relationship.dependentColumn && relationship.principalTable && relationship.principalColumn)), 'dependente e principal identificados');
add('campo obrigatorio coberto', allFields.some((field) => field.required), `${allFields.filter((field) => field.required).length} campo(s)`);
add('campo numerico coberto', allFields.some((field) => /valor|preco|total|quantidade|qtd|codigo|numero|id/i.test(field.name)), 'campo numerico por nome');
add('campo data coberto', allFields.some((field) => /data/i.test(field.name) || /DateTimePicker/i.test(field.source?.componentClass ?? '')), 'campo ou componente de data');
add('campo booleano coberto', allFields.some((field) => /CheckBox/i.test(field.source?.componentClass ?? '')), 'checkbox Delphi');
add('validacao Pascal coberta', allValidations.length > 0, `${allValidations.length} validacao(oes)`);
add('regra positiva coberta', allValidations.some((validation) => /maior que zero|positivo|superior a zero/i.test(validation.message)), allValidations.map((validation) => validation.message).join(' | ') || 'nenhuma');

const failed = checks.filter((check) => !check.ok);
const output = {
  ok: failed.length === 0,
  fixtures: resolvedFixtures.length,
  fields: allFields.length,
  lookups: allLookups.length,
  tabs: allTabs.length,
  detailGrids: allDetails.length,
  relationships: allRelationships.length,
  validations: allValidations.length,
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed.map((check) => check.name),
  checks
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('Cobertura funcional dos fixtures do Delphi Parser');
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  console.log(`Resumo: ${output.passed}/${output.total} capacidades cobertas em ${output.fixtures} fixture(s)`);
  if (failed.length > 0) console.error(`Falhas: ${output.failures.join(', ')}`);
}

if (failed.length > 0) process.exit(1);
