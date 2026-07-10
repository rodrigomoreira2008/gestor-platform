const sections = [
  {
    title: 'Analise',
    commands: [
      ['parse:dfm <arquivo.dfm>', 'Converte o DFM textual em arvore JSON.'],
      ['parse:pas <arquivo.pas>', 'Extrai metodos, SQL, validacoes, datasets e eventos do PAS.'],
      ['resolve:form <dfm> <pas> <entidade> [tabela]', 'Monta o ResolvedForm usado pelos geradores.'],
      ['list:components [--role=...] [--search=...] [--json]', 'Lista o catalogo de componentes reconhecidos.'],
      ['analyze:components <dfm> [opcoes]', 'Audita classes, DataField e componentes desconhecidos.']
    ]
  },
  {
    title: 'Geracao',
    commands: [
      ['gen:backend <dfm> <pas> <entidade> [tabela] [saida]', 'Gera artefatos ASP.NET Core.'],
      ['gen:frontend <dfm> <pas> <entidade> [tabela] [saida]', 'Gera artefatos React/MUI.'],
      ['gen:report <dfm> <pas> <entidade> [tabela] [saida]', 'Gera relatorio Markdown da migracao.']
    ]
  },
  {
    title: 'Validacao',
    commands: [
      ['validate:components', 'Valida a integridade do catalogo de componentes.'],
      ['validate:backend <dfm> <pas> <entidade> [tabela]', 'Valida a geracao backend em memoria.'],
      ['validate:frontend <dfm> <pas> <entidade> [tabela]', 'Valida a geracao frontend em memoria.'],
      ['validate:generated <dfm> <pas> <entidade> [tabela]', 'Valida todos os artefatos gerados.'],
      ['validate:fixture-components', 'Audita os DFM dos fixtures.'],
      ['validate:fixture-artifacts', 'Valida os artefatos dos fixtures.'],
      ['validate:all', 'Executa build e toda a suite de validacao do pacote.']
    ]
  }
] as const;

console.log('@gestor/delphi-parser');
console.log('Uso: pnpm --filter @gestor/delphi-parser <comando> [argumentos]\n');

for (const section of sections) {
  console.log(section.title);
  for (const [command, description] of section.commands) {
    console.log(`  ${command.padEnd(65)} ${description}`);
  }
  console.log('');
}

console.log('Documentacao: docs/generator/index.md');
