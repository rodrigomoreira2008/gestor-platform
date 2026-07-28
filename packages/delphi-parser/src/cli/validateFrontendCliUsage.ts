import { renderFrontendCliUsage } from '../frontendCliUsage';

const complete = renderFrontendCliUsage();
const compact = renderFrontendCliUsage({ includeExample: false });

const checks = [
  complete.includes('gen:frontend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida] [opcoes]'),
  complete.includes('--delphi-actions'),
  complete.includes('--route-path=<caminho>'),
  complete.includes('--route-export-alias=<nome>'),
  complete.includes('-h, --help'),
  complete.includes('Exemplo Delphi:'),
  complete.includes('--route-path=/cadastros/produtos'),
  complete.includes('--route-export-alias=produtoRoute'),
  !compact.includes('Exemplo Delphi:'),
  compact.includes('Opcoes:')
];

const passed = checks.filter(Boolean).length;

if (passed !== checks.length) {
  throw new Error(`FRONTEND_CLI_USAGE_FAILED: checks=${checks.length}: passed=${passed}`);
}

console.log(`FRONTEND_CLI_USAGE_OK: checks=${checks.length}: passed=${passed}`);
