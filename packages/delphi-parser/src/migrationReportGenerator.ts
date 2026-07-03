import type { ResolvedForm } from './resolvedForm';

export interface MigrationReportSection {
  title: string;
  items: string[];
}

export interface MigrationReport {
  title: string;
  coveragePercent: number;
  sections: MigrationReportSection[];
}

export function generateMigrationReport(resolved: ResolvedForm): MigrationReport {
  const inferredTables = unique(resolved.databaseQueries.flatMap((query) => query.tables.map((table) => table.alias ? `${table.name} (${table.alias})` : table.name)));
  const inferredJoins = resolved.databaseQueries.flatMap((query) => query.joins.map((join) => `${query.methodName}: ${join.type} join ${join.table.name}${join.condition ? ` on ${join.condition}` : ''}`));
  const inferredRelationships = resolved.relationships.map((relationship) => `${relationship.sourceTable}.${relationship.sourceColumn} -> ${relationship.targetTable}.${relationship.targetColumn}; confianca: ${relationship.confidence}; evidencia: ${relationship.evidence}`);
  const inferredLookups = resolved.lookups.map((lookup) => `${lookup.fieldName}; source: ${lookup.lookupSource ?? 'nao inferido'}; key: ${lookup.keyField ?? 'id'}; label: ${lookup.displayField ?? 'descricao'}; confianca: ${lookup.confidence}; evidencia: ${lookup.evidence}`);

  const automatedItems = [
    resolved.fields.length > 0 ? `${resolved.fields.length} campo(s) resolvido(s)` : undefined,
    resolved.actions.length > 0 ? `${resolved.actions.length} acao(oes) resolvida(s)` : undefined,
    resolved.datasets.length > 0 ? `${resolved.datasets.length} dataset(s) detectado(s)` : undefined,
    resolved.queries.length > 0 ? `${resolved.queries.length} consulta(s) SQL detectada(s)` : undefined,
    resolved.databaseQueries.length > 0 ? `${resolved.databaseQueries.length} consulta(s) com estrutura SQL inferida` : undefined,
    inferredTables.length > 0 ? `${inferredTables.length} tabela(s) inferida(s) a partir de SQL` : undefined,
    inferredJoins.length > 0 ? `${inferredJoins.length} join(s) inferido(s) a partir de SQL` : undefined,
    inferredRelationships.length > 0 ? `${inferredRelationships.length} relacionamento(s) inferido(s) a partir de joins` : undefined,
    inferredLookups.length > 0 ? `${inferredLookups.length} lookup(s) inferido(s) a partir de componentes Delphi` : undefined,
    resolved.validations.length > 0 ? `${resolved.validations.length} validacao(oes) detectada(s)` : undefined
  ].filter(Boolean) as string[];

  const reviewItems = [
    ...resolved.warnings,
    ...resolved.queries.map((query) => `Revisar SQL em ${query.methodName}: ${query.text}`),
    ...resolved.databaseQueries.filter((query) => query.tables.length === 0).map((query) => `Consulta sem tabela inferida: ${query.methodName}`),
    ...resolved.relationships.filter((relationship) => relationship.confidence !== 'high').map((relationship) => `Confirmar relacionamento ${relationship.sourceTable}.${relationship.sourceColumn} -> ${relationship.targetTable}.${relationship.targetColumn} (${relationship.confidence})`),
    ...resolved.lookups.filter((lookup) => lookup.confidence !== 'high').map((lookup) => `Confirmar lookup ${lookup.fieldName} (${lookup.confidence})`),
    ...resolved.datasets.filter((dataset) => !dataset.tableName && !dataset.dataSource).map((dataset) => `Dataset sem origem clara: ${dataset.name}`)
  ];

  const totalSignals = automatedItems.length + reviewItems.length;
  const coveragePercent = totalSignals === 0 ? 0 : Math.round((automatedItems.length / totalSignals) * 100);

  return {
    title: `Relatorio de migracao: ${resolved.form.entity}`,
    coveragePercent,
    sections: [
      { title: 'Convertido automaticamente', items: automatedItems.length > 0 ? automatedItems : ['Nenhum item convertido automaticamente.'] },
      { title: 'Banco de dados inferido', items: [...inferredTables.map((table) => `Tabela: ${table}`), ...inferredJoins.map((join) => `Join: ${join}`), ...resolved.databaseQueries.filter((query) => query.where).map((query) => `Where em ${query.methodName}: ${query.where}`), ...resolved.databaseQueries.filter((query) => query.orderBy).map((query) => `Order by em ${query.methodName}: ${query.orderBy}`)] },
      { title: 'Relacionamentos inferidos', items: inferredRelationships.length > 0 ? inferredRelationships : ['Nenhum relacionamento inferido nesta etapa.'] },
      { title: 'Lookups inferidos', items: inferredLookups.length > 0 ? inferredLookups : ['Nenhum lookup inferido nesta etapa.'] },
      { title: 'Revisao manual recomendada', items: reviewItems.length > 0 ? reviewItems : ['Nenhuma revisao manual detectada nesta etapa.'] }
    ]
  };
}

export function renderMigrationReportMarkdown(resolved: ResolvedForm): string {
  const report = generateMigrationReport(resolved);
  const sections = report.sections.map((section) => `## ${section.title}\n\n${section.items.length > 0 ? section.items.map((item) => `- ${item}`).join('\n') : '- Nenhum item.'}`).join('\n\n');
  return `# ${report.title}\n\nCobertura automatica estimada: ${report.coveragePercent}%\n\n${sections}\n`;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
