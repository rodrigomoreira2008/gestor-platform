import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

const checks: CheckResult[] = [];
const nodeMajor = Number(process.versions.node.split('.')[0] ?? 0);

checks.push({
  name: 'Node.js',
  ok: nodeMajor >= 20,
  detail: `versao ${process.versions.node}; esperado >= 20`
});

const requiredPaths = [
  'package.json',
  'tsconfig.json',
  'src/index.ts',
  'src/dfmParser.ts',
  'src/pasParser.ts',
  'src/componentMapping.ts',
  'src/resolveForm.ts',
  'fixtures'
];

for (const relativePath of requiredPaths) {
  const absolutePath = resolve(process.cwd(), relativePath);
  checks.push({
    name: relativePath,
    ok: existsSync(absolutePath),
    detail: absolutePath
  });
}

const packagePath = resolve(process.cwd(), 'package.json');
if (existsSync(packagePath)) {
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as {
      name?: string;
      scripts?: Record<string, string>;
    };
    checks.push({
      name: 'package name',
      ok: packageJson.name === '@gestor/delphi-parser',
      detail: packageJson.name ?? 'nome ausente'
    });
    for (const script of ['build', 'resolve:form', 'validate:components', 'validate:all']) {
      checks.push({
        name: `script ${script}`,
        ok: Boolean(packageJson.scripts?.[script]),
        detail: packageJson.scripts?.[script] ?? 'script ausente'
      });
    }
  } catch (error) {
    checks.push({
      name: 'package.json valido',
      ok: false,
      detail: error instanceof Error ? error.message : 'erro desconhecido'
    });
  }
}

checks.push({
  name: 'CI',
  ok: true,
  detail: process.env.CI ? 'ambiente CI detectado' : 'execucao local'
});

const failed = checks.filter((check) => !check.ok);
const json = process.argv.includes('--json');

if (json) {
  console.log(JSON.stringify({
    ok: failed.length === 0,
    total: checks.length,
    failed: failed.length,
    cwd: process.cwd(),
    platform: process.platform,
    architecture: process.arch,
    checks
  }, null, 2));
} else {
  console.log(`Delphi Parser Doctor - ${process.platform}/${process.arch}`);
  console.log(`Diretorio: ${process.cwd()}`);
  for (const check of checks) {
    console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  }
  console.log(`Resumo: ${checks.length - failed.length}/${checks.length} verificacoes OK`);
}

if (failed.length > 0) {
  console.error(`Diagnostico falhou em ${failed.length} verificacao(oes). Execute o comando dentro de packages/delphi-parser apos instalar as dependencias.`);
  process.exit(1);
}
