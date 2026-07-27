export interface ParsedFrontendCliArgs {
  positional: string[];
  withDelphiActions: boolean;
  routePath?: string;
  routeExportAlias?: string;
}

export function parseFrontendCliArgs(values: string[]): ParsedFrontendCliArgs {
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
    const value = current.slice(prefix.length).trim();
    if (!value) throw new Error(`A opcao ${name} exige um valor.`);
    return { matched: true, consumedNext: false, value };
  }

  if (current !== name) return { matched: false, consumedNext: false };

  const next = values[index + 1];
  if (!next || next.startsWith('--')) {
    throw new Error(`A opcao ${name} exige um valor.`);
  }

  return { matched: true, consumedNext: true, value: next.trim() };
}
