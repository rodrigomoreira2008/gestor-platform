import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface DocumentationCheck {
  name: string;
  ok: boolean;
  detail: string;
}

const checks: DocumentationCheck[] = [];
const packageRoot = process.cwd();
const repositoryRoot = resolve(packageRoot, '../..');
const packageJsonPath = resolve(packageRoot, 'package.json');
const packageReadmePath = resolve(packageRoot, 'README.md');
const docsIndexPath = resolve(repositoryRoot, 'docs/generator/index.md');

const requiredDocs = [
  'quickstart.md',
  'acceptance-criteria.md',
  'component-mapping.md',
  'backend-generator.md',
  'frontend-generator.md',
  'pas-parser.md',
  'troubleshooting.md'
];

for (const filename of requiredDocs) {
  const path = resolve(repositoryRoot, 'docs/generator', filename);
  checks.push({ name: `documento ${filename}`, ok: existsSync(path), detail: path });
}

if (existsSync(packageJsonPath) && existsSync(packageReadmePath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { scripts?: Record<string, string> };
  const readme = readFileSync(packageReadmePath, 'utf8');
  const documentedCommands = ['help', 'doctor', 'version', 'resolve:form', 'gen:backend', 'gen:frontend', 'gen:report', 'validate:generated', 'validate:all'];

  for (const command of documentedCommands) {
    checks.push({
      name: `script ${command}`,
      ok: Boolean(packageJson.scripts?.[command]),
      detail: packageJson.scripts?.[command] ?? 'script ausente'
    });
    checks.push({
      name: `README menciona ${command}`,
      ok: readme.includes(command),
      detail: packageReadmePath
    });
  }
}

if (existsSync(docsIndexPath)) {
  const index = readFileSync(docsIndexPath, 'utf8');
  for (const filename of requiredDocs) {
    checks.push({
      name: `indice referencia ${filename}`,
      ok: index.includes(filename),
      detail: docsIndexPath
    });
  }
}

const failed = checks.filter((check) => !check.ok);
const output = {
  ok: failed.length === 0,
  total: checks.length,
  failed: failed.length,
  checks
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('Validacao da documentacao do Delphi Parser');
  for (const check of checks) {
    console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  }
  console.log(`Resumo: ${checks.length - failed.length}/${checks.length} verificacoes OK`);
}

if (failed.length > 0) {
  process.exit(1);
}
