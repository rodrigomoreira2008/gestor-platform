import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { renderMigrationReportMarkdown } from '../migrationReportGenerator';
import { resolveDelphiForm } from '../resolveForm';

const [, , dfmPath, pasPath, entity, table, outputPath = 'generated/migration-report.md'] = process.argv;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser gen:report <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), {
  entity,
  table,
  dfmFile: dfmPath.split(/[\\/]/).at(-1),
  pasFile: pasPath.split(/[\\/]/).at(-1)
});

const target = join(process.cwd(), outputPath);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, renderMigrationReportMarkdown(resolved), 'utf8');
console.log(`Gerado: ${outputPath}`);
