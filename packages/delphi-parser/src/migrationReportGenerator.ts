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
  const automatedItems = [
    resolved.fields.length > 0 ? `${resolved.fields.length} campo(s) resolvido(s)` : undefined,
    resolved.actions.length > 0 ? `${resolved.actions.length} acao(oes) resolvida(s)` : undefined,
    resolved.datasets.length > 0 ? `${resolved.datasets.length} dataset(s) detectado(s)` : undefined,
    resolved.queries.length > 0 ? `${resolved.queries.length} consulta(s) SQL detectada(s)` : undefined,
    resolved.validations.length > 0 ? `${resolved.validations.length} validacao(oes) detectada(s)` : undefined
  ].filter(Boolean) as string[];

  const reviewItems = [
    ...resolved.warnings,
    ...resolved.queries.map((query) => `Revisar SQL em ${query.methodName}: ${query.text}`),
    ...resolved.datasets
      .filter((dataset) => !dataset.tableName && !dataset.dataSource)
      .map((dataset) => `Dataset sem origem clara: ${dataset.name}`)
  ];

  const totalSignals = automatedItems.length + reviewItems.length;
  const coveragePercent = totalSignals === 0 ? 0 : Math.round((automatedItems.length / totalSignals) * 100);

  return {
    title: `Relatorio de migracao: ${resolved.form.entity}`,
    coveragePercent,
    sections: [
      {
        title: 'Convertido automaticamente',
        items: automatedItems.length > 0 ? automatedItems : ['Nenhum item convertido automaticamente.']
      },
      {
        title: 'Revisao manual recomendada',
        items: reviewItems.length > 0 ? reviewItems : ['Nenhuma revisao manual detectada nesta etapa.']
      }
    ]
  };
}

export function renderMigrationReportMarkdown(resolved: ResolvedForm): string {
  const report = generateMigrationReport(resolved);
  const sections = report.sections
    .map((section) => `## ${section.title}\n\n${section.items.map((item) => `- ${item}`).join('\n')}`)
    .join('\n\n');

  return `# ${report.title}\n\nCobertura automatica estimada: ${report.coveragePercent}%\n\n${sections}\n`;
}
