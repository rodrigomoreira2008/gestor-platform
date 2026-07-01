import type { DelphiFormNode, DelphiFormParseResult } from './types';

const objectPattern = /^\s*object\s+(\w+)\s*:\s*(\w+)/i;
const endPattern = /^\s*end\s*$/i;
const propertyPattern = /^\s*([\w.]+)\s*=\s*(.+?)\s*$/;

export function parseDfm(input: string): DelphiFormParseResult {
  const warnings: string[] = [];
  const stack: DelphiFormNode[] = [];
  let root: DelphiFormNode | null = null;

  const lines = input.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
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
      current.properties[propertyMatch[1]] = normalizeDfmValue(propertyMatch[2]);
    }
  }

  if (stack.length > 0) warnings.push(`DFM terminou com ${stack.length} object(s) sem end.`);

  return { root, warnings };
}

function normalizeDfmValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replace(/''/g, "'");
  return trimmed;
}
