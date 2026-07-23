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

export interface PascalEventHint {
  componentName: string;
  eventName: string;
  handlerName: string;
}

export interface PascalDependencyHint {
  name: string;
  source: 'uses' | 'include';
}

export interface PascalRuleHint {
  methodName: string;
  kind: 'condition' | 'assignment' | 'call' | 'abort';
  expression: string;
  target?: string;
}

export interface PascalParseResult {
  methods: PascalMethod[];
  sqlSnippets: PascalSqlSnippet[];
  validationHints: PascalValidationHint[];
  datasetHints: PascalDatasetHint[];
  eventHints: PascalEventHint[];
  dependencyHints: PascalDependencyHint[];
  ruleHints: PascalRuleHint[];
  warnings: string[];
}

const methodPattern = /^\s*(procedure|function)\s+(?:\w+\.)?(\w+)\s*(?:\((.*?)\))?\s*(?::\s*([\w.<>]+))?\s*;/i;
const componentDeclarationPattern = /^\s*(\w+)\s*:\s*(T(?:FDQuery|Query|ClientDataSet|DataSource|Table|ADOQuery|ADOTable|IBQuery|IBDataSet))\s*;/i;
const tableNamePattern = /(\w+)\.(?:TableName|CommandText)\s*:=\s*'([^']*(?:''[^']*)*)'/gi;
const dataSourcePattern = /(\w+)\.DataSet\s*:=\s*(\w+)/gi;
const eventAssignmentPattern = /(\w+)\.(On\w+)\s*:=\s*(\w+)/gi;
const sqlAssignmentPattern = /(?:SQL\.Text|CommandText)\s*:=\s*((?:'[^']*(?:''[^']*)*'\s*(?:\+\s*)?\s*)+)/gi;
const sqlAddPattern = /SQL\.Add\s*\(\s*'([^']*(?:''[^']*)*)'\s*\)/gi;
const messagePattern = /(?:ShowMessage|MessageDlg|raise\s+Exception\.Create)\s*\(\s*'([^']*(?:''[^']*)*)'/gi;
const requiredFieldPattern = /(?:FieldByName\s*\(\s*'([^']+)'\s*\)|\b(\w+)\s*)\.(?:IsNull|Text\s*=\s*'')/i;
const usesPattern = /\buses\s+([\s\S]*?);/gi;
const includePattern = /\{\$I(?:NCLUDE)?\s+([^}]+)\}/gi;
const conditionPattern = /^\s*(?:else\s+)?if\s+(.+?)\s+then\b/i;
const assignmentPattern = /^\s*([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*:=\s*(.+?);?\s*$/i;
const callPattern = /^\s*([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*(?:\((.*)\))?\s*;\s*$/i;

export function parsePascalUnit(input: string): PascalParseResult {
  const warnings: string[] = [];
  const methods = collectMethods(input, warnings);
  const sqlSnippets = methods.flatMap((method) => collectSql(method));
  const validationHints = methods.flatMap((method) => collectValidationHints(method));
  const datasetHints = collectDatasetHints(input);
  const eventHints = collectEventHints(input, methods);
  const dependencyHints = collectDependencyHints(input);
  const ruleHints = methods.flatMap((method) => collectRuleHints(method));

  return {
    methods,
    sqlSnippets,
    validationHints,
    datasetHints,
    eventHints,
    dependencyHints,
    ruleHints,
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

function collectEventHints(input: string, methods: PascalMethod[]): PascalEventHint[] {
  const methodNames = new Set(methods.map((method) => method.name.toLowerCase()));
  const hints = new Map<string, PascalEventHint>();

  for (const match of input.matchAll(eventAssignmentPattern)) {
    const hint = {
      componentName: match[1],
      eventName: match[2],
      handlerName: match[3]
    };
    hints.set(`${hint.componentName}.${hint.eventName}.${hint.handlerName}`, hint);
  }

  for (const method of methods) {
    const inferred = inferEventFromHandler(method.name);
    if (!inferred) continue;

    const hint = {
      componentName: inferred.componentName,
      eventName: inferred.eventName,
      handlerName: method.name
    };

    if (methodNames.has(hint.handlerName.toLowerCase())) {
      hints.set(`${hint.componentName}.${hint.eventName}.${hint.handlerName}`, hint);
    }
  }

  return [...hints.values()];
}

function collectDependencyHints(input: string): PascalDependencyHint[] {
  const hints = new Map<string, PascalDependencyHint>();

  for (const match of input.matchAll(usesPattern)) {
    const block = stripPascalComments(match[1]);
    for (const entry of block.split(',')) {
      const name = entry.trim().split(/\s+in\s+/i)[0]?.trim();
      if (!name || !/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/.test(name)) continue;
      hints.set(`uses:${name.toLowerCase()}`, { name, source: 'uses' });
    }
  }

  for (const match of input.matchAll(includePattern)) {
    const name = match[1].trim().replace(/^['"]|['"]$/g, '');
    if (!name) continue;
    hints.set(`include:${name.toLowerCase()}`, { name, source: 'include' });
  }

  return [...hints.values()];
}

function collectRuleHints(method: PascalMethod): PascalRuleHint[] {
  const hints: PascalRuleHint[] = [];

  for (const rawLine of method.body.split(/\r?\n/)) {
    const line = stripPascalComment(rawLine).trim();
    if (!line || /^(begin|end;?|else)$/i.test(line)) continue;

    const condition = line.match(conditionPattern);
    if (condition) {
      hints.push({ methodName: method.name, kind: 'condition', expression: condition[1].trim() });
      continue;
    }

    if (/^Abort\s*;?$/i.test(line)) {
      hints.push({ methodName: method.name, kind: 'abort', expression: 'Abort' });
      continue;
    }

    const assignment = line.match(assignmentPattern);
    if (assignment) {
      hints.push({
        methodName: method.name,
        kind: 'assignment',
        target: assignment[1],
        expression: assignment[2].replace(/;$/, '').trim()
      });
      continue;
    }

    const call = line.match(callPattern);
    if (call && !/^(if|for|while|case|with|repeat|until)$/i.test(call[1])) {
      hints.push({
        methodName: method.name,
        kind: 'call',
        target: call[1],
        expression: call[2]?.trim() ?? ''
      });
    }
  }

  return hints;
}

function inferEventFromHandler(handlerName: string): { componentName: string; eventName: string } | null {
  const knownSuffixes: Array<[string, string]> = [
    ['Click', 'OnClick'],
    ['Exit', 'OnExit'],
    ['Enter', 'OnEnter'],
    ['Change', 'OnChange'],
    ['KeyDown', 'OnKeyDown'],
    ['KeyPress', 'OnKeyPress'],
    ['KeyUp', 'OnKeyUp'],
    ['Close', 'OnClose'],
    ['Create', 'OnCreate'],
    ['Show', 'OnShow']
  ];

  const suffix = knownSuffixes.find(([name]) => handlerName.endsWith(name));
  if (!suffix) return null;

  const componentName = handlerName.slice(0, -suffix[0].length);
  if (!componentName) return null;

  return { componentName, eventName: suffix[1] };
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
  return line.replace(/\/\/.*$/, '').replace(/\{(?!\$I(?:NCLUDE)?\b).*?\}/gi, '');
}

function stripPascalComments(value: string): string {
  return value
    .replace(/\/\/.*$/gm, '')
    .replace(/\{[\s\S]*?\}/g, '')
    .replace(/\(\*[\s\S]*?\*\)/g, '');
}

function unescapePascalString(value: string): string {
  return value.replace(/''/g, "'");
}
