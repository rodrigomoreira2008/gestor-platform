import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface WorkflowCheck {
  name: string;
  ok: boolean;
  detail: string;
}

const packageRoot = process.cwd();
const repositoryRoot = resolve(packageRoot, '../..');
const workflowPath = resolve(repositoryRoot, '.github/workflows/delphi-fixtures.yml');
const checks: WorkflowCheck[] = [];

checks.push({
  name: 'workflow existe',
  ok: existsSync(workflowPath),
  detail: workflowPath
});

if (existsSync(workflowPath)) {
  const workflow = readFileSync(workflowPath, 'utf8');
  const requiredFragments = [
    'pull_request:',
    'workflow_dispatch:',
    'permissions:',
    'contents: read',
    'concurrency:',
    'cancel-in-progress: true',
    'timeout-minutes:',
    'actions/checkout@v4',
    'pnpm/action-setup@v4',
    'actions/setup-node@v4',
    'node-version: 20',
    'pnpm install',
    'validate:scripts',
    'validate:docs',
    'validate:components',
    'validate:fixture-components',
    'validate:fixture-artifacts'
  ];

  for (const fragment of requiredFragments) {
    checks.push({
      name: `workflow contem ${fragment}`,
      ok: workflow.includes(fragment),
      detail: workflowPath
    });
  }

  checks.push({
    name: 'workflow sem permissao de escrita',
    ok: !/contents:\s*write/i.test(workflow) && !/pull-requests:\s*write/i.test(workflow),
    detail: workflowPath
  });

  checks.push({
    name: 'workflow usa cache do pnpm',
    ok: /cache:\s*pnpm/.test(workflow),
    detail: workflowPath
  });
}

const failed = checks.filter((check) => !check.ok);
const output = {
  ok: failed.length === 0,
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed.map((check) => check.name),
  workflow: workflowPath,
  checks
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('Validacao do workflow do Delphi Parser');
  for (const check of checks) {
    console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  }
  console.log(`Resumo: ${output.passed}/${output.total} verificacoes OK`);
  if (failed.length > 0) {
    console.error(`Falhas: ${output.failures.join(', ')}`);
  }
}

if (failed.length > 0) {
  process.exit(1);
}
