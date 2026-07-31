import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

interface FixtureCheck {
  name: string;
  ok: boolean;
  detail: string;
}

const packageRoot = process.cwd();
const fixturesRoot = resolve(packageRoot, 'fixtures');
const packageJsonPath = resolve(packageRoot, 'package.json');
const checks: FixtureCheck[] = [];

checks.push({ name: 'diretorio fixtures existe', ok: existsSync(fixturesRoot), detail: fixturesRoot });
checks.push({ name: 'package.json existe', ok: existsSync(packageJsonPath), detail: packageJsonPath });

if (!existsSync(fixturesRoot) || !statSync(fixturesRoot).isDirectory() || !existsSync(packageJsonPath)) {
  console.error('Estrutura de fixtures incompleta.');
  process.exit(1);
}

let scripts: Record<string, string> = {};
try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { scripts?: Record<string, string> };
  scripts = packageJson.scripts ?? {};
} catch (error) {
  console.error(`package.json invalido: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  process.exit(1);
}

const files = readdirSync(fixturesRoot).filter((file) => ['.dfm', '.pas'].includes(extname(file).toLowerCase()));
const dfmFiles = files.filter((file) => extname(file).toLowerCase() === '.dfm').sort();
const pasFiles = files.filter((file) => extname(file).toLowerCase() === '.pas').sort();
const baseNames = [...new Set(files.map((file) => basename(file, extname(file))))].sort();

checks.push({ name: 'fixtures DFM encontrados', ok: dfmFiles.length > 0, detail: `${dfmFiles.length} arquivo(s)` });
checks.push({ name: 'quantidade DFM/PAS equilibrada', ok: dfmFiles.length === pasFiles.length, detail: `${dfmFiles.length} DFM / ${pasFiles.length} PAS` });

for (const baseName of baseNames) {
  const dfmPath = resolve(fixturesRoot, `${baseName}.dfm`);
  const pasPath = resolve(fixturesRoot, `${baseName}.pas`);
  checks.push({ name: `${baseName} possui DFM`, ok: existsSync(dfmPath), detail: dfmPath });
  checks.push({ name: `${baseName} possui PAS`, ok: existsSync(pasPath), detail: pasPath });

  for (const path of [dfmPath, pasPath]) {
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf8');
    checks.push({ name: `${basename(path)} nao vazio`, ok: content.trim().length > 0, detail: `${content.length} caractere(s)` });
  }

  const matchingValidationScripts = Object.entries(scripts).filter(([name, command]) =>
    name.startsWith('validate:fixture:') && command.includes(`fixtures/${baseName}.dfm`) && command.includes(`fixtures/${baseName}.pas`)
  );
  checks.push({
    name: `${baseName} possui script de validacao`,
    ok: matchingValidationScripts.length === 1,
    detail: matchingValidationScripts.map(([name]) => name).join(', ') || 'script ausente'
  });

  const matchingAnalysisScripts = Object.entries(scripts).filter(([name, command]) =>
    name.startsWith('analyze:fixture:') && command.includes(`fixtures/${baseName}.dfm`)
  );
  checks.push({
    name: `${baseName} possui script de analise`,
    ok: matchingAnalysisScripts.length === 1,
    detail: matchingAnalysisScripts.map(([name]) => name).join(', ') || 'script ausente'
  });
}

const failed = checks.filter((check) => !check.ok);
const output = {
  ok: failed.length === 0,
  fixtures: baseNames.length,
  dfmFiles: dfmFiles.length,
  pasFiles: pasFiles.length,
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed.map((check) => check.name),
  checks
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('Validacao dos fixtures do Delphi Parser');
  for (const check of checks) {
    console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  }
  console.log(`Resumo: ${output.passed}/${output.total} verificacoes OK em ${output.fixtures} fixture(s)`);
  if (failed.length > 0) console.error(`Falhas: ${output.failures.join(', ')}`);
}

if (failed.length > 0) process.exit(1);
