const TYPESCRIPT_RESERVED_WORDS = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield'
]);

const MAX_POSITIONAL_ARGUMENTS = 5;

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

      routePath = validateRoutePath(routePathResult.value!);
      index += routePathResult.consumedNext ? 1 : 0;
      continue;
    }

    const aliasResult = readNamedOption(values, index, '--route-export-alias');
    if (aliasResult.matched) {
      if (routeExportAlias !== undefined) {
        throw new Error('A opcao --route-export-alias foi informada mais de uma vez.');
      }

      routeExportAlias = validateExportAlias(aliasResult.value!);
      index += aliasResult.consumedNext ? 1 : 0;
      continue;
    }

    if (value.startsWith('-')) {
      throw new Error(`Opcao desconhecida: ${value}`);
    }

    positional.push(value);
  }

  if (!help && positional.length > MAX_POSITIONAL_ARGUMENTS) {
    throw new Error(`Foram informados ${positional.length} argumentos posicionais; o maximo permitido e ${MAX_POSITIONAL_ARGUMENTS}.`);
  }

  if (!help && !withDelphiActions && (routePath !== undefined || routeExportAlias !== undefined)) {
    throw new Error('As opcoes --route-path e --route-export-alias exigem --delphi-actions.');
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

function validateRoutePath(value: string): string {
  if (/\s/.test(value) || value.includes('?') || value.includes('#')) {
    throw new Error('A opcao --route-path deve conter apenas um caminho de rota, sem espacos, query string ou fragmento.');
  }

  if (!value.startsWith('/') || value.includes('\\') || value.includes('://')) {
    throw new Error('A opcao --route-path deve ser um caminho interno iniciado por / e usar somente barras normais.');
  }

  let decodedValue: string;
  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    throw new Error('A opcao --route-path contem uma codificacao percentual invalida.');
  }

  if (decodedValue !== value && /[\\/?#\s]/.test(decodedValue.replace(value, ''))) {
    throw new Error('A opcao --route-path nao pode ocultar separadores, espacos, query string ou fragmento por codificacao percentual.');
  }

  if (/%(?:2e)/i.test(value)) {
    throw new Error('A opcao --route-path nao pode codificar segmentos de navegacao com ponto.');
  }

  if (value !== '/' && value.includes('//')) {
    throw new Error('A opcao --route-path nao pode conter barras consecutivas.');
  }

  const segments = value.split('/');
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('A opcao --route-path nao pode conter os segmentos "." ou "..".');
  }

  return value === '/' ? value : value.replace(/\/+$/, '');
}

function validateExportAlias(value: string): string {
  if (!/^[$A-Z_a-z][$\w]*$/.test(value)) {
    throw new Error('A opcao --route-export-alias deve ser um identificador TypeScript valido.');
  }

  if (TYPESCRIPT_RESERVED_WORDS.has(value)) {
    throw new Error('A opcao --route-export-alias nao pode ser uma palavra reservada do TypeScript.');
  }

  return value;
}
