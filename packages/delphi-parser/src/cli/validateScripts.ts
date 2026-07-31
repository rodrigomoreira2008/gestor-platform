import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface ScriptCheck {
  name: string;
  ok: boolean;
  detail: string;
}

const packageRoot = process.cwd();
const packageJsonPath = resolve(packageRoot, 'package.json');
const checks: ScriptCheck[] = [];

if (!existsSync(packageJsonPath)) {
  console.error(`package.json nao encontrado em ${packageRoot}`);
  process.exit(1);
}

let packageJson: { scripts?: Record<string, string> };
try {
  packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { scripts?: Record<string, string> };
} catch (error) {
  console.error(`package.json invalido: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  process.exit(1);
}

const scripts = packageJson.scripts ?? {};
const scriptEntries = Object.entries(scripts);

checks.push({
  name: 'catalogo de scripts nao vazio',
  ok: scriptEntries.length > 0,
  detail: `${scriptEntries.length} script(s)`
});

for (const [name, command] of scriptEntries) {
  checks.push({
    name: `script ${name} nao vazio`,
    ok: command.trim().length > 0,
    detail: command
  });

  checks.push({
    name: `script ${name} sem espacos externos`,
    ok: command === command.trim(),
    detail: command
  });

  const tsxMatches = [...command.matchAll(/(?:^|\s)tsx\s+([^\s]+)/g)];
  for (const match of tsxMatches) {
    const relativePath = match[1];
    if (!relativePath) continue;
    const absolutePath = resolve(packageRoot, relativePath);
    checks.push({
      name: `${name} referencia ${relativePath}`,
      ok: existsSync(absolutePath),
      detail: absolutePath
    });
  }

  const pnpmMatches = [...command.matchAll(/(?:^|&&\s*)pnpm\s+([A-Za-z0-9:_-]+)/g)];
  for (const match of pnpmMatches) {
    const referencedScript = match[1];
    if (!referencedScript) continue;
    checks.push({
      name: `${name} referencia script ${referencedScript}`,
      ok: Boolean(scripts[referencedScript]),
      detail: scripts[referencedScript] ?? 'script ausente'
    });
  }
}

const duplicateCommands = scriptEntries
  .filter(([, command], index, entries) => entries.findIndex(([, other]) => other === command) !== index)
  .map(([name]) => name);

checks.push({
  name: 'comandos duplicados',
  ok: duplicateCommands.length === 0,
  detail: duplicateCommands.length === 0 ? 'nenhum' : duplicateCommands.join(', ')
});

const selfReferences = scriptEntries.filter(([name, command]) => {
  const references = [...command.matchAll(/(?:^|&&\s*)pnpm\s+([A-Za-z0-9:_-]+)/g)].map((match) => match[1]);
  return references.includes(name);
});
checks.push({
  name: 'scripts sem autorreferencia direta',
  ok: selfReferences.length === 0,
  detail: selfReferences.length === 0 ? 'nenhuma' : selfReferences.map(([name]) => name).join(', ')
});

const failed = checks.filter((check) => !check.ok);
const output = {
  ok: failed.length === 0,
  scripts: scriptEntries.length,
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed.map((check) => check.name),
  checks
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('Validacao dos scripts do Delphi Parser');
  for (const check of checks) {
    console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  }
  console.log(`Resumo: ${output.passed}/${output.total} verificacoes OK em ${output.scripts} scripts`);
  if (failed.length > 0) {
    console.error(`Falhas: ${output.failures.join(', ')}`);
  }
}

if (failed.length > 0) {
  process.exit(1);
}
