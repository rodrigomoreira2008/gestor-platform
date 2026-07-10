import { existsSync } from 'node:fs';
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
}

if (failed.length > 0) {
  console.error(`Diagnostico falhou em ${failed.length} verificacao(oes). Execute o comando dentro de packages/delphi-parser apos instalar as dependencias.`);
  process.exit(1);
}
