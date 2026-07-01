import type { DelphiFormNode, DelphiFormParseResult } from './types';

const objectPattern = /^\s*object\s+(\w+)\s*:\s*(\w+)/i;
const endPattern = /^\s*end\s*$/i;
const propertyPattern = /^\s*([\w.]+)\s*=\s*(.*)$/;

export function parseDfm(input: string): DelphiFormParseResult {
  const warnings: string[] = [];
  const stack: DelphiFormNode[] = [];
  let root: DelphiFormNode | null = null;

  const lines = input.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const objectMatch = line.match(objectPattern);
    if (objectMatch) {
      const node: DelphiFormNode = {
        name: objectMatch[1],
        className: objectMatch[2],
        properties: {},
        children: []
      };

      const parent = stack.at(-1);
      if (parent) parent.children.push(node);
      else if (!root) root = node;
      else warnings.push(`Linha ${index + 1}: objeto raiz adicional ignorado.`);

      stack.push(node);
      continue;
    }

    if (endPattern.test(line)) {
      if (stack.length === 0) warnings.push(`Linha ${index + 1}: end sem object correspondente.`);
      else stack.pop();
      continue;
    }

    const propertyMatch = line.match(propertyPattern);
    if (propertyMatch && stack.length > 0) {
      const current = stack.at(-1)!;
      const propertyName = propertyMatch[1];
      const rawValue = propertyMatch[2].trim();

      if (isMultilineValueStart(rawValue)) {
        const collected = collectMultilineValue(lines, index, rawValue);
        current.properties[propertyName] = normalizeDfmValue(collected.value);
        index = collected.endIndex;
      } else {
        current.properties[propertyName] = normalizeDfmValue(rawValue);
      }
    }
  }

  if (stack.length > 0) warnings.push(`DFM terminou com ${stack.length} object(s) sem end.`);

  return { root, warnings };
}

function isMultilineValueStart(value: string): boolean {
  return value === '(' || value === '<' || value === '{' || value.endsWith('(') || value.endsWith('<') || value.endsWith('{');
}

function collectMultilineValue(lines: string[], startIndex: number, firstValue: string): { value: string; endIndex: number } {
  const chunks = [firstValue];
  const terminator = getTerminator(firstValue);

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    chunks.push(line);
    if (line === terminator) return { value: chunks.join('\n'), endIndex: index };
  }

  return { value: chunks.join('\n'), endIndex: lines.length - 1 };
}

function getTerminator(value: string): string {
  if (value.includes('<')) return '>';
  if (value.includes('{')) return '}';
  return ')';
}

function normalizeDfmValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replace(/''/g, "'");
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return normalizeStringList(trimmed);
  return trimmed;
}

function normalizeStringList(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '(' && line !== ')')
    .map((line) => normalizeDfmValue(line))
    .join('\n');
}
