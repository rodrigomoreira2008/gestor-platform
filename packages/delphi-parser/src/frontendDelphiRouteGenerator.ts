export interface FrontendDelphiRouteGeneratorOptions {
  entityPascal: string;
  plural: string;
  routePath?: string;
  exportAlias?: string;
}

export function renderFrontendDelphiRouteSnippet(options: FrontendDelphiRouteGeneratorOptions): string {
  const routePath = normalizeRoutePath(options.routePath ?? `/${options.plural}`);
  const exportAlias = options.exportAlias?.trim() || `${lowerFirst(options.entityPascal)}DelphiRoute`;

  return `// Rota recomendada para preservar os eventos e métodos da aplicação Delphi
import { ${options.entityPascal}DelphiPage } from '../modules/${options.plural}/pages/${options.entityPascal}DelphiPage';

export const ${exportAlias} = {
  path: '${escapeSingleQuote(routePath)}',
  element: <${options.entityPascal}DelphiPage />
};
`;
}

export function renderFrontendPageSelectionSnippet(options: FrontendDelphiRouteGeneratorOptions): string {
  const routePath = normalizeRoutePath(options.routePath ?? `/${options.plural}`);

  return `// Escolha uma das páginas geradas conforme a estratégia de migração.
// CRUD genérico:
// import { ${options.entityPascal}Page } from '../modules/${options.plural}/pages/${options.entityPascal}Page';
// { path: '${escapeSingleQuote(routePath)}', element: <${options.entityPascal}Page /> }

// Comportamento orientado pelos eventos Delphi:
import { ${options.entityPascal}DelphiPage } from '../modules/${options.plural}/pages/${options.entityPascal}DelphiPage';
{ path: '${escapeSingleQuote(routePath)}', element: <${options.entityPascal}DelphiPage /> }
`;
}

function normalizeRoutePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '/';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/g, '') : withLeadingSlash;
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
