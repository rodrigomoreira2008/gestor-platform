import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'src/cli/showHelp.ts'), 'utf8');

const checks = [
  source.includes('gen:frontend <dfm> <pas> <entidade> [tabela] [saida] [opcoes]'),
  source.includes("title: 'Opcoes de gen:frontend'"),
  source.includes("['--delphi-actions'"),
  source.includes("['--route-path=<caminho>'"),
  source.includes("['--route-export-alias=<nome>'"),
  source.includes('Gera runtime, controladores, pagina e rota orientados pelos eventos Delphi.'),
  source.includes('--delphi-actions --route-path=/cadastros/produtos'),
  source.includes('--route-export-alias=produtoRoute'),
  source.includes('apps/frontend/src/modules/produtos'),
  source.includes("console.log('Documentacao: docs/generator/index.md');")
];

const failed = checks.map((passed, index) => ({ passed, index: index + 1 })).filter((check) => !check.passed);

if (failed.length > 0) {
  console.error(`FRONTEND_CLI_HELP_FAILED: checks=${checks.length}: failed=${failed.map((check) => check.index).join(',')}`);
  process.exit(1);
}

console.log(`FRONTEND_CLI_HELP_OK: checks=${checks.length}: passed=${checks.length}`);
