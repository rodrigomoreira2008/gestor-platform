import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderFrontendCliUsage } from '../frontendCliUsage';

const source = readFileSync(resolve(process.cwd(), 'src/cli/showHelp.ts'), 'utf8');
const usage = renderFrontendCliUsage();

const checks = [
  source.includes("import { renderFrontendCliUsage } from '../frontendCliUsage';"),
  source.includes('gen:frontend <dfm> <pas> <entidade> [tabela] [saida] [opcoes]'),
  source.includes("console.log('Detalhes de gen:frontend:');"),
  source.includes('console.log(renderFrontendCliUsage());'),
  !source.includes("title: 'Opcoes de gen:frontend'"),
  usage.includes('--delphi-actions'),
  usage.includes('--route-path=<caminho>'),
  usage.includes('--route-export-alias=<nome>'),
  usage.includes('apps/frontend/src/modules/produtos'),
  source.includes("console.log('Documentacao: docs/generator/index.md');")
];

const failed = checks.map((passed, index) => ({ passed, index: index + 1 })).filter((check) => !check.passed);

if (failed.length > 0) {
  console.error(`FRONTEND_CLI_HELP_FAILED: checks=${checks.length}: failed=${failed.map((check) => check.index).join(',')}`);
  process.exit(1);
}

console.log(`FRONTEND_CLI_HELP_OK: checks=${checks.length}: passed=${checks.length}`);