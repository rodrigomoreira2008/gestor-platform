export interface FrontendDelphiRouteGeneratorOptions {
  entityPascal: string;
  plural: string;
}

export function renderFrontendDelphiRouteSnippet(options: FrontendDelphiRouteGeneratorOptions): string {
  return `// Rota recomendada para preservar os eventos e métodos da aplicação Delphi\nimport { ${options.entityPascal}DelphiPage } from '../modules/${options.plural}/pages/${options.entityPascal}DelphiPage';\n\n{ path: '/${options.plural}', element: <${options.entityPascal}DelphiPage /> }\n`;
}

export function renderFrontendPageSelectionSnippet(options: FrontendDelphiRouteGeneratorOptions): string {
  return `// Escolha uma das páginas geradas conforme a estratégia de migração.\n// CRUD genérico:\n// import { ${options.entityPascal}Page } from '../modules/${options.plural}/pages/${options.entityPascal}Page';\n\n// Comportamento orientado pelos eventos Delphi:\nimport { ${options.entityPascal}DelphiPage } from '../modules/${options.plural}/pages/${options.entityPascal}DelphiPage';\n\nexport const ${lowerFirst(options.entityPascal)}Route = {\n  path: '/${options.plural}',\n  element: <${options.entityPascal}DelphiPage />\n};\n`;
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
