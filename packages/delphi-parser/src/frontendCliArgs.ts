export interface ParsedFrontendCliArgs {
  positional: string[];
  withDelphiActions: boolean;
  help: boolean;
  routePath?: string;
  routeExportAlias?: string;
}

export function parseFrontendCliArgs(values: string[]): ParsedFrontendCliArgs {
  const positional: string[] = [];
  let withDelphiActions = false;
  let help = false;
  let routePath: string | undefined;
  let routeExportAlias: string | undefined;

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    if (value === '--help' || value === '-h') {
      help = true;
      continue;
    }

    if (value === '--delphi-actions') {
      if (withDelphiActions) {
        throw new Error('A opcao --delphi-actions foi informada mais de uma vez.');
      }

      withDelphiActions = true;
      continue;
    }

    const routePathResult = readNamedOption(values, index, '--route-path');
    if (routePathResult.matched) {
      if (routePath !== undefined) {
        throw new Error('A opcao --route-path foi informada mais de uma vez.');
      }

      routePath = routePathResult.value;
      index += routePathResult.consumedNext ? 1 : 0;
      continue;
    }

    const aliasResult = readNamedOption(values, index, '--route-export-alias');
    if (aliasResult.matched) {
      if (routeExportAlias !== undefined) {
        throw new Error('A opcao --route-export-alias foi informada mais de uma vez.');
      }

      routeExportAlias = aliasResult.value;
      index += aliasResult.consumedNext ? 1 : 0;
      continue;
    }

    if (value.startsWith('-')) {
      throw new Error(`Opcao desconhecida: ${value}`);
    }

    positional.push(value);
  }

  return { positional, withDelphiActions, help, routePath, routeExportAlias };
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
  if (!next || next.startsWith('-')) {
    throw new Error(`A opcao ${name} exige um valor.`);
  }

  const value = next.trim();
  if (!value) {
    throw new Error(`A opcao ${name} exige um valor.`);
  }

  return { matched: true, consumedNext: true, value };
}
