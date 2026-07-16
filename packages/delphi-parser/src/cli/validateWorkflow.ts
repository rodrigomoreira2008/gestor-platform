import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface WorkflowCheck { name: string; ok: boolean; detail: string; }

const packageRoot = process.cwd();
const repositoryRoot = resolve(packageRoot, '../..');
const workflowPath = resolve(repositoryRoot, '.github/workflows/delphi-fixtures.yml');
const checks: WorkflowCheck[] = [];
checks.push({ name: 'workflow existe', ok: existsSync(workflowPath), detail: workflowPath });

if (existsSync(workflowPath)) {
  const workflow = readFileSync(workflowPath, 'utf8');
  const requiredFragments = [
    'pull_request:', 'workflow_dispatch:', "- 'packages/delphi-parser/**'", "- 'docs/generator/**'", "- '.github/workflows/delphi-fixtures.yml'",
    'permissions:', 'contents: read', 'concurrency:', 'github.workflow', 'github.ref', 'cancel-in-progress: true', 'CI: true',
    'runs-on: ubuntu-latest', 'timeout-minutes:', 'actions/checkout@v4', 'pnpm/action-setup@v4', 'actions/setup-node@v4',
    'actions/setup-dotnet@v4', "dotnet-version: '8.0.x'", 'node-version: 20', 'cache: pnpm', 'pnpm install', 'doctor',
    'validate:package', 'validate:workflow', 'validate:scripts', 'validate:docs', 'validate:fixtures', 'validate:components',
    'validate:fixture-components', 'validate:fixture-artifacts', 'validate:fixture-paths', 'validate:fixture-placeholders',
    'validate:fixture-budgets', 'validate:fixture-text-format', 'validate:fixture-names', 'validate:fixture-boundaries',
    'validate:fixture-syntax', 'validate:fixture-imports', 'validate:fixture-determinism', 'validate:fixture-contracts',
    'validate:fixture-repository', 'validate:fixture-backend-compile', 'validate:fixture-backend-runtime', 'validate:fixture-backend-http',
    'validate:fixture-frontend-compile', 'validate:fixture-frontend-runtime', 'validate:fixture-frontend-api',
    'validate:fixture-frontend-hooks', 'validate:fixture-frontend-schema', 'validate:fixture-frontend-page',
    'validate:fixture-routes', 'validate:fixture-semantic', 'validate:fixture-coverage'
  ];
  for (const fragment of requiredFragments) checks.push({ name: `workflow contem ${fragment}`, ok: workflow.includes(fragment), detail: workflowPath });

  checks.push({ name: 'workflow sem permissao de escrita', ok: !/(contents|pull-requests|issues|actions|checks|packages|statuses):\s*write/i.test(workflow), detail: workflowPath });
  checks.push({ name: 'workflow sem continue-on-error', ok: !/continue-on-error:\s*true/i.test(workflow), detail: workflowPath });

  const timeoutMatch = workflow.match(/timeout-minutes:\s*(\d+)/);
  const timeout = Number(timeoutMatch?.[1] ?? 0);
  checks.push({ name: 'timeout entre 5 e 30 minutos', ok: timeout >= 5 && timeout <= 30, detail: timeoutMatch ? `${timeout} minutos` : 'timeout ausente' });

  const requiredCommands = [
    'doctor', 'validate:package', 'validate:workflow', 'validate:scripts', 'validate:docs', 'validate:fixtures', 'build',
    'validate:components', 'validate:fixture-components', 'validate:fixture-artifacts', 'validate:fixture-paths',
    'validate:fixture-placeholders', 'validate:fixture-budgets', 'validate:fixture-text-format', 'validate:fixture-names',
    'validate:fixture-boundaries', 'validate:fixture-syntax', 'validate:fixture-imports', 'validate:fixture-determinism',
    'validate:fixture-contracts', 'validate:fixture-repository', 'validate:fixture-backend-compile',
    'validate:fixture-backend-runtime', 'validate:fixture-backend-http', 'validate:fixture-frontend-compile',
    'validate:fixture-frontend-runtime', 'validate:fixture-frontend-api', 'validate:fixture-frontend-hooks',
    'validate:fixture-frontend-schema', 'validate:fixture-frontend-page', 'validate:fixture-routes',
    'validate:fixture-semantic', 'validate:fixture-coverage'
  ];
  for (const command of requiredCommands) {
    const occurrences = [...workflow.matchAll(new RegExp(`@gestor/delphi-parser ${command.replace(':', '\\:')}`, 'g'))].length;
    checks.push({ name: `comando ${command} executado uma vez`, ok: occurrences === 1, detail: `${occurrences} ocorrencia(s)` });
  }

  const artifactStep = workflow.indexOf('Validate generated fixture artifacts');
  const pathsStep = workflow.indexOf('Validate generated artifact paths');
  const placeholdersStep = workflow.indexOf('Validate generated placeholders');
  const budgetsStep = workflow.indexOf('Validate generated artifact budgets');
  const textFormatStep = workflow.indexOf('Validate generated text format');
  const namesStep = workflow.indexOf('Validate generated naming conventions');
  const boundariesStep = workflow.indexOf('Validate generated layer boundaries');
  const syntaxStep = workflow.indexOf('Validate generated TypeScript syntax');
  const importsStep = workflow.indexOf('Validate generated import graph');
  const determinismStep = workflow.indexOf('Validate deterministic generation');
  const contractsStep = workflow.indexOf('Validate backend frontend contracts');
  const repositoryStep = workflow.indexOf('Validate generated persistence layer');
  const backendCompileStep = workflow.indexOf('Compile generated backend');
  const backendRuntimeStep = workflow.indexOf('Execute generated backend runtime smoke tests');
  const backendHttpStep = workflow.indexOf('Execute generated backend HTTP CRUD tests');
  const frontendCompileStep = workflow.indexOf('Compile generated frontend');
  const frontendRuntimeStep = workflow.indexOf('Execute generated frontend runtime smoke tests');
  const frontendApiStep = workflow.indexOf('Execute generated frontend API contract tests');
  const frontendHooksStep = workflow.indexOf('Execute generated frontend hooks contract tests');
  const frontendSchemaStep = workflow.indexOf('Execute generated frontend schema contract tests');
  const frontendPageStep = workflow.indexOf('Execute generated frontend page contract tests');
  const routesStep = workflow.indexOf('Validate generated API routes');
  const semanticStep = workflow.indexOf('Validate semantic fixture behavior');
  const coverageStep = workflow.indexOf('Validate fixture capability coverage');
  checks.push({
    name: 'etapas finais em ordem de profundidade',
    ok: artifactStep >= 0 && pathsStep > artifactStep && placeholdersStep > pathsStep && budgetsStep > placeholdersStep && textFormatStep > budgetsStep && namesStep > textFormatStep && boundariesStep > namesStep && syntaxStep > boundariesStep && importsStep > syntaxStep && determinismStep > importsStep && contractsStep > determinismStep && repositoryStep > contractsStep && backendCompileStep > repositoryStep && backendRuntimeStep > backendCompileStep && backendHttpStep > backendRuntimeStep && frontendCompileStep > backendHttpStep && frontendRuntimeStep > frontendCompileStep && frontendApiStep > frontendRuntimeStep && frontendHooksStep > frontendApiStep && frontendSchemaStep > frontendHooksStep && frontendPageStep > frontendSchemaStep && routesStep > frontendPageStep && semanticStep > routesStep && coverageStep > semanticStep,
    detail: `artefatos=${artifactStep}, caminhos=${pathsStep}, placeholders=${placeholdersStep}, orcamentos=${budgetsStep}, formato=${textFormatStep}, nomes=${namesStep}, fronteiras=${boundariesStep}, sintaxe=${syntaxStep}, imports=${importsStep}, determinismo=${determinismStep}, contratos=${contractsStep}, persistencia=${repositoryStep}, backend=${backendCompileStep}, runtime=${backendRuntimeStep}, http=${backendHttpStep}, frontend=${frontendCompileStep}, frontendRuntime=${frontendRuntimeStep}, frontendApi=${frontendApiStep}, frontendHooks=${frontendHooksStep}, frontendSchema=${frontendSchemaStep}, frontendPage=${frontendPageStep}, rotas=${routesStep}, semantica=${semanticStep}, cobertura=${coverageStep}`
  });
}

const failed = checks.filter((check) => !check.ok);
const output = { ok: failed.length === 0, total: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed.map((check) => check.name), workflow: workflowPath, checks };
if (process.argv.includes('--json')) console.log(JSON.stringify(output, null, 2));
else {
  console.log('Validacao do workflow do Delphi Parser');
  for (const check of checks) console.log(`[${check.ok ? 'OK' : 'ERRO'}] ${check.name}: ${check.detail}`);
  console.log(`Resumo: ${output.passed}/${output.total} verificacoes OK`);
  if (failed.length > 0) console.error(`Falhas: ${output.failures.join(', ')}`);
}
if (failed.length > 0) process.exit(1);
