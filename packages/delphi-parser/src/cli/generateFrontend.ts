import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { generateFrontendFiles } from '../frontendGenerator';
import { generateFrontendFilesWithDelphiActions } from '../frontendGeneratorWithDelphiActions';
import { resolveDelphiForm } from '../resolveForm';

const cli = parseCliArgs(process.argv.slice(2));
const [dfmPath, pasPath, entity, table, outputRoot] = cli.positional;

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

if (!cli.withDelphiActions && (cli.routePath || cli.routeExportAlias)) {
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

const files = cli.withDelphiActions
  ? generateFrontendFilesWithDelphiActions(resolvedForm, {
      outputRoot,
      routePath: cli.routePath,
      routeExportAlias: cli.routeExportAlias
    })
  : generateFrontendFiles(resolvedForm, outputRoot ? { outputRoot } : {});

for (const file of files) {
  const target = resolve(process.cwd(), file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, file.content, 'utf8');
  console.log(`Gerado: ${target}`);
}

interface ParsedCliArgs {
  positional: string[];
  withDelphiActions: boolean;
  routePath?: string;
  routeExportAlias?: string;
}

export function parseCliArgs(values: string[]): ParsedCliArgs {
  const positional: string[] = [];
  let withDelphiActions = false;
  let routePath: string | undefined;
  let routeExportAlias: string | undefined;

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    if (value === '--delphi-actions') {
      withDelphiActions = true;
      continue;
    }

    const routePathResult = readNamedOption(values, index, '--route-path');
    if (routePathResult.matched) {
      routePath = routePathResult.value;
      index += routePathResult.consumedNext ? 1 : 0;
      continue;
    }

    const aliasResult = readNamedOption(values, index, '--route-export-alias');
    if (aliasResult.matched) {
      routeExportAlias = aliasResult.value;
      index += aliasResult.consumedNext ? 1 : 0;
      continue;
    }

    if (value.startsWith('--')) {
      throw new Error(`Opcao desconhecida: ${value}`);
    }

    positional.push(value);
  }

  return { positional, withDelphiActions, routePath, routeExportAlias };
}

interface NamedOptionResult {
  matched: boolean;
  consumedNext: boolean;
  value?: string;
}

function readNamedOption(values: string[], index: number, name: string): NamedOptionResult {
  const current = values[index];
  const prefix = `${name}=`;

  if (current.startsWith(prefix)) {
    return { matched: true, consumedNext: false, value: current.slice(prefix.length).trim() || undefined };
  }

  if (current !== name) return { matched: false, consumedNext: false };

  const next = values[index + 1];
  if (!next || next.startsWith('--')) {
    throw new Error(`A opcao ${name} exige um valor.`);
  }

  return { matched: true, consumedNext: true, value: next.trim() || undefined };
}
