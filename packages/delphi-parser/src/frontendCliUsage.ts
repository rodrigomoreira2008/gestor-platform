export interface FrontendCliUsageOptions {
  includeExample?: boolean;
}

export function renderFrontendCliUsage(options: FrontendCliUsageOptions = {}): string {
  const lines = [
    'Uso:',
    '  pnpm --filter @gestor/delphi-parser gen:frontend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida] [opcoes]',
    '',
    'Opcoes:',
    '  --delphi-actions                  Gera runtime, controladores, pagina e rota orientados pelos eventos Delphi.',
    '  --route-path=<caminho>            Define o caminho usado nos snippets de rota Delphi.',
    '  --route-export-alias=<nome>       Define o nome exportado para o objeto de rota Delphi.',
    '  -h, --help                       Mostra esta ajuda.'
  ];

  if (options.includeExample !== false) {
    lines.push(
      '',
      'Exemplo Delphi:',
      '  pnpm --filter @gestor/delphi-parser gen:frontend produto.dfm produto.pas Produto PRODUTOS apps/frontend/src/modules/produtos --delphi-actions --route-path=/cadastros/produtos --route-export-alias=produtoRoute'
    );
  }

  return lines.join('\n');
}
