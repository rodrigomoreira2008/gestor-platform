import type { DfmComponent, DfmParseResult } from './types.js';

const OBJECT_PATTERN = /^(object|inherited)\s+([^:]+)\s*:\s*(\S+)/i;
const END_PATTERN = /^end$/i;
const PROPERTY_PATTERN = /^([A-Za-z0-9_.]+)\s*=\s*(.*)$/;

export function parseDfm(content: string): DfmParseResult {
  const rootStack: DfmComponent[] = [];
  const components: DfmComponent[] = [];
  const warnings: string[] = [];
  let root: DfmComponent | null = null;

  const lines = content.replace(/\r\n/g, '\n').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    const objectMatch = line.match(OBJECT_PATTERN);
    if (objectMatch) {
      const component: DfmComponent = {
        name: objectMatch[2].trim(),
        className: objectMatch[3].trim(),
        properties: {},
        children: []
      };

      const parent = rootStack.at(-1);
      if (parent) {
        parent.children.push(component);
      } else if (!root) {
        root = component;
      } else {
        warnings.push(`Root extra ignorado: ${component.name}`);
      }

      rootStack.push(component);
      components.push(component);
      continue;
    }

    if (END_PATTERN.test(line)) {
      if (!rootStack.pop()) {
        warnings.push('end encontrado sem object correspondente');
      }
      continue;
    }

    const propertyMatch = line.match(PROPERTY_PATTERN);
    if (propertyMatch) {
      const current = rootStack.at(-1);
      if (!current) {
        warnings.push(`Propriedade fora de componente: ${line}`);
        continue;
      }

      const [, key, value] = propertyMatch;
      current.properties[key] = normalizeDfmValue(value);
    }
  }

  if (rootStack.length > 0) {
    warnings.push(`${rootStack.length} componente(s) não finalizado(s) com end`);
  }

  return { root, components, warnings };
}

function normalizeDfmValue(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  return trimmed;
}
