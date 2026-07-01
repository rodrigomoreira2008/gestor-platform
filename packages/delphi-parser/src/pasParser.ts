export interface PascalMethod {
  name: string;
  kind: 'procedure' | 'function';
  parameters?: string;
  returnType?: string;
  body: string;
}

export interface PascalSqlSnippet {
  methodName: string;
  text: string;
}

export interface PascalValidationHint {
  methodName: string;
  field?: string;
  message: string;
}

export interface PascalDatasetHint {
  name: string;
  className: string;
  tableName?: string;
  dataSource?: string;
}

export interface PascalParseResult {
  methods: PascalMethod[];
  sqlSnippets: PascalSqlSnippet[];
  validationHints: PascalValidationHint[];
  datasetHints: PascalDatasetHint[];
  warnings: string[];
}

const methodPattern = /^\s*(procedure|function)\s+(?:\w+\.)?(\w+)\s*(?:\((.*?)\))?\s*(?::\s*([\w.<>]+))?\s*;/i;
const componentDeclarationPattern = /^\s*(\w+)\s*:\s*(T(?:FDQuery|Query|ClientDataSet|DataSource|Table|ADOQuery|ADOTable|IBQuery|IBDataSet))\s*;/i;
const tableNamePattern = /(\w+)\.(?:TableName|CommandText)\s*:=\s*'([^']*(?:''[^']*)*)'/gi;
const dataSourcePattern = /(\w+)\.DataSet\s*:=\s*(\w+)/gi;
const sqlAssignmentPattern = /(?:SQL\.Text|CommandText)\s*:=\s*((?:'[^']*(?:''[^']*)*'\s*(?:\+\s*)?\s*)+)/gi;
const sqlAddPattern = /SQL\.Add\s*\(\s*'([^']*(?:''[^']*)*)'\s*\)/gi;
const messagePattern = /(?:ShowMessage|MessageDlg|raise\s+Exception\.Create)\s*\(\s*'([^']*(?:''[^']*)*)'/gi;
const requiredFieldPattern = /(?:FieldByName\s*\(\s*'([^']+)'\s*\)|\b(\w+)\s*)\.(?:IsNull|Text\s*=\s*'')/i;

export function parsePascalUnit(input: string): PascalParseResult {
  const warnings: string[] = [];
  const methods = collectMethods(input, warnings);
  const sqlSnippets = methods.flatMap((method) => collectSql(method));
  const validationHints = methods.flatMap((method) => collectValidationHints(method));
  const datasetHints = collectDatasetHints(input);

  return {
    methods,
    sqlSnippets,
    validationHints,
    datasetHints,
    warnings
  };
}

function collectMethods(input: string, warnings: string[]): PascalMethod[] {
  const lines = input.split(/\r?\n/);
  const methods: PascalMethod[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(methodPattern);
    if (!match) continue;

    const beginIndex = findNextBegin(lines, index + 1);
    if (beginIndex === -1) {
      warnings.push(`Método ${match[2]} sem bloco begin/end encontrado.`);
      continue;
    }

    const endIndex = findMatchingEnd(lines, beginIndex);
    if (endIndex === -1) {
      warnings.push(`Método ${match[2]} sem end correspondente.`);
      continue;
    }

    methods.push({
      kind: match[1].toLowerCase() as 'procedure' | 'function',
      name: match[2],
      parameters: match[3],
      returnType: match[4],
      body: lines.slice(beginIndex, endIndex + 1).join('\n')
    });

    index = endIndex;
  }

  return methods;
}

function collectDatasetHints(input: string): PascalDatasetHint[] {
  const datasets = new Map<string, PascalDatasetHint>();

  for (const line of input.split(/\r?\n/)) {
    const declaration = line.match(componentDeclarationPattern);
    if (!declaration) continue;
    datasets.set(declaration[1], { name: declaration[1], className: declaration[2] });
  }

  for (const match of input.matchAll(tableNamePattern)) {
    const current = datasets.get(match[1]) ?? { name: match[1], className: 'unknown' };
    current.tableName = unescapePascalString(match[2]);
    datasets.set(match[1], current);
  }

  for (const match of input.matchAll(dataSourcePattern)) {
    const current = datasets.get(match[1]) ?? { name: match[1], className: 'TDataSource' };
    current.dataSource = match[2];
    datasets.set(match[1], current);
  }

  return [...datasets.values()];
}

function findNextBegin(lines: string[], startIndex: number): number {
  for (let index = startIndex; index < lines.length; index += 1) {
    if (/^\s*begin\s*$/i.test(lines[index])) return index;
  }
  return -1;
}

function findMatchingEnd(lines: string[], beginIndex: number): number {
  let depth = 0;

  for (let index = beginIndex; index < lines.length; index += 1) {
    const line = stripPascalComment(lines[index]);
    if (/\bbegin\b/i.test(line)) depth += 1;
    if (/\bend\b/i.test(line)) depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
}

function collectSql(method: PascalMethod): PascalSqlSnippet[] {
  const snippets: PascalSqlSnippet[] = [];

  for (const match of method.body.matchAll(sqlAssignmentPattern)) {
    snippets.push({ methodName: method.name, text: normalizePascalStringExpression(match[1]) });
  }

  for (const match of method.body.matchAll(sqlAddPattern)) {
    snippets.push({ methodName: method.name, text: unescapePascalString(match[1]) });
  }

  return snippets;
}

function collectValidationHints(method: PascalMethod): PascalValidationHint[] {
  const hints: PascalValidationHint[] = [];
  const messages = [...method.body.matchAll(messagePattern)].map((match) => unescapePascalString(match[1]));
  const fieldMatch = method.body.match(requiredFieldPattern);
  const field = fieldMatch?.[1] ?? fieldMatch?.[2];

  for (const message of messages) {
    hints.push({ methodName: method.name, field, message });
  }

  return hints;
}

function normalizePascalStringExpression(value: string): string {
  return [...value.matchAll(/'([^']*(?:''[^']*)*)'/g)]
    .map((match) => unescapePascalString(match[1]))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripPascalComment(line: string): string {
  return line.replace(/\/\/.*$/, '').replace(/\{.*?\}/g, '');
}

function unescapePascalString(value: string): string {
  return value.replace(/''/g, "'");
}
