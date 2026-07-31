import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface MetadataCheck {
  name: string;
  ok: boolean;
  detail: string;
}

const packageRoot = process.cwd();
const packageJsonPath = resolve(packageRoot, 'package.json');
const tsconfigPath = resolve(packageRoot, 'tsconfig.json');
const checks: MetadataCheck[] = [];

function readJson(path: string): Record<string, unknown> | undefined {
  if (!existsSync(path)) {
    checks.push({ name: `${path} existe`, ok: false, detail: path });
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch (error) {
    checks.push({
      name: `${path} valido`,
      ok: false,
      detail: error instanceof Error ? error.message : 'erro desconhecido'
    });
    return undefined;
  }
}

const packageJson = readJson(packageJsonPath);
const tsconfig = readJson(tsconfigPath);

if (packageJson) {
  const dependencies = packageJson.dependencies as Record<string, string> | undefined;
  const devDependencies = packageJson.devDependencies as Record<string, string> | undefined;
  checks.push({ name: 'nome do pacote', ok: packageJson.name === '@gestor/delphi-parser', detail: String(packageJson.name ?? 'ausente') });
  checks.push({ name: 'versao semantica', ok: /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(String(packageJson.version ?? '')), detail: String(packageJson.version ?? 'ausente') });
  checks.push({ name: 'pacote privado', ok: packageJson.private === true, detail: String(packageJson.private ?? 'ausente') });
  checks.push({ name: 'modulos ESM', ok: packageJson.type === 'module', detail: String(packageJson.type ?? 'ausente') });
  checks.push({ name: 'entrada JavaScript', ok: packageJson.main === 'dist/index.js', detail: String(packageJson.main ?? 'ausente') });
  checks.push({ name: 'entrada de tipos', ok: packageJson.types === 'dist/index.d.ts', detail: String(packageJson.types ?? 'ausente') });
  checks.push({ name: 'dependencia do DSL via workspace', ok: dependencies?.['@gestor/dsl'] === 'workspace:*', detail: dependencies?.['@gestor/dsl'] ?? 'ausente' });
  checks.push({ name: 'tsx em devDependencies', ok: Boolean(devDependencies?.tsx), detail: devDependencies?.tsx ?? 'ausente' });
  checks.push({ name: 'sem latest em dependencies de runtime', ok: !Object.values(dependencies ?? {}).includes('latest'), detail: JSON.stringify(dependencies ?? {}) });
}

if (tsconfig) {
  const compilerOptions = tsconfig.compilerOptions as Record<string, unknown> | undefined;
  const include = tsconfig.include as unknown[] | undefined;
  checks.push({ name: 'tsconfig estende base', ok: tsconfig.extends === '../../tsconfig.base.json', detail: String(tsconfig.extends ?? 'ausente') });
  checks.push({ name: 'outDir dist', ok: compilerOptions?.outDir === 'dist', detail: String(compilerOptions?.outDir ?? 'ausente') });
  checks.push({ name: 'rootDir src', ok: compilerOptions?.rootDir === 'src', detail: String(compilerOptions?.rootDir ?? 'ausente') });
  checks.push({ name: 'declarations habilitadas', ok: compilerOptions?.declaration === true, detail: String(compilerOptions?.declaration ?? 'ausente') });
  checks.push({ name: 'declaration maps habilitados', ok: compilerOptions?.declarationMap === true, detail: String(compilerOptions?.declarationMap ?? 'ausente') });
  checks.push({ name: 'include cobre src TypeScript', ok: include?.includes('src/**/*.ts') === true, detail: JSON.stringify(include ?? []) });
}

const failed = checks.filter((check) => !check.ok);
const output = {
  ok: failed.length === 0,
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed.map((check) => check.name),
  checks
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('Validacao dos metadados do Delphi Parser');
  for (const check of checks) {
    console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  }
  console.log(`Resumo: ${output.passed}/${output.total} verificacoes OK`);
  if (failed.length > 0) console.error(`Falhas: ${output.failures.join(', ')}`);
}

if (failed.length > 0) process.exit(1);
