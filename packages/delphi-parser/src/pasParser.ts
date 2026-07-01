export interface PascalMethod {
  name: string;
  parameters?: string;
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

export interface PascalParseResult {
  methods: PascalMethod[];
  sqlSnippets: PascalSqlSnippet[];
  validationHints: PascalValidationHint[];
  warnings: string[];
}

const methodPattern = /^\s*procedure\s+(?:\w+\.)?(\w+)\s*(?:\((.*?)\))?\s*;/i;
const sqlPattern = /(?:SQL\.Text|CommandText)\s*:=\s*'([^']*(?:''[^']*)*)'/gi;
const messagePattern = /(?:ShowMessage|MessageDlg|raise\s+Exception\.Create)\s*\(\s*'([^']*(?:''[^']*)*)'/gi;
const requiredFieldPattern = /(?:FieldByName\s*\(\s*'([^']+)'\s*\)|\b(\w+)\s*)\.(?:IsNull|Text\s*=\s*'')/i;

export function parsePascalUnit(input: string): PascalParseResult {
  const warnings: string[] = [];
  const methods = collectMethods(input, warnings);
  const sqlSnippets = methods.flatMap((method) => collectSql(method));
  const validationHints = methods.flatMap((method) => collectValidationHints(method));

  return {
    methods,
    sqlSnippets,
    validationHints,
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
      warnings.push(`Método ${match[1]} sem bloco begin/end encontrado.`);
      continue;
    }

    const endIndex = findMatchingEnd(lines, beginIndex);
    if (endIndex === -1) {
      warnings.push(`Método ${match[1]} sem end correspondente.`);
      continue;
    }

    methods.push({
      name: match[1],
      parameters: match[2],
      body: lines.slice(beginIndex, endIndex + 1).join('\n')
    });

    index = endIndex;
  }

  return methods;
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
  for (const match of method.body.matchAll(sqlPattern)) {
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

function stripPascalComment(line: string): string {
  return line.replace(/\/\/.*$/, '').replace(/\{.*?\}/g, '');
}

function unescapePascalString(value: string): string {
  return value.replace(/''/g, "'");
}
