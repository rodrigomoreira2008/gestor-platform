import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { generateFrontendFiles } from '../frontendGenerator';
import { generateFrontendFilesWithDelphiActions } from '../frontendGeneratorWithDelphiActions';
import { resolveDelphiForm } from '../resolveForm';

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const [dfmPath, pasPath, entity, table, outputRoot] = positional;
const withDelphiActions = args.includes('--delphi-actions');
const routePath = readOption(args, '--route-path');
const routeExportAlias = readOption(args, '--route-export-alias');

if (!dfmPath || !pasPath || !entity) {
  console.error([
    'Uso:',
    'pnpm --filter @gestor/delphi-parser gen:frontend <arquivo.dfm> <arquivo.pas> <entidade> [tabela] [saida]',
    '  [--delphi-actions]',
    '  [--route-path=/cadastros/entidade]',
    '  [--route-export-alias=entidadeRoute]'
  ].join(' '));
  process.exit(1);
}

if (!withDelphiActions && (routePath || routeExportAlias)) {
  console.error('As opcoes --route-path e --route-export-alias exigem --delphi-actions.');
  process.exit(1);
}

const resolvedForm = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), {
  entity,
  table,
  dfmFile: dfmPath.split(/[\\/]/).at(-1),
  pasFile: pasPath.split(/[\\/]/).at(-1)
});

if (resolvedForm.fields.length === 0) {
  console.error('Nao foi possivel gerar o frontend: nenhum campo foi resolvido a partir do DFM/PAS.');
  process.exit(1);
}

const files = withDelphiActions
  ? generateFrontendFilesWithDelphiActions(resolvedForm, {
      outputRoot,
      routePath,
      routeExportAlias
    })
  : generateFrontendFiles(resolvedForm, outputRoot ? { outputRoot } : {});

for (const file of files) {
  const target = resolve(process.cwd(), file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, file.content, 'utf8');
  console.log(`Gerado: ${target}`);
}

function readOption(values: string[], name: string): string | undefined {
  const prefix = `${name}=`;
  const inline = values.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length).trim() || undefined;

  const index = values.indexOf(name);
  if (index < 0) return undefined;
  const value = values[index + 1];
  return value && !value.startsWith('--') ? value.trim() || undefined : undefined;
}
