import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { renderMigrationReportMarkdown } from '../migrationReportGenerator';
import { resolveDelphiForm } from '../resolveForm';

const [, , dfmPath, pasPath, entity, table, outputPath = 'generated/migration-report.md'] = process.argv;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser gen:report <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]');
  process.exit(1);
}

const resolvedForm = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), {
  entity,
  table,
  dfmFile: dfmPath.split(/[\\/]/).at(-1),
  pasFile: pasPath.split(/[\\/]/).at(-1)
});

if (resolvedForm.fields.length === 0) {
  console.error('Nao foi possivel gerar o relatorio: nenhum campo foi resolvido a partir do DFM/PAS.');
  process.exit(1);
}

const target = resolve(process.cwd(), outputPath);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, renderMigrationReportMarkdown(resolvedForm), 'utf8');
console.log(`Gerado: ${target}`);
