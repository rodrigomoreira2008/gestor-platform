import type { InferredTab } from './tabInference';

export function renderFrontendTabDefinitions(tabs: InferredTab[], exportName = 'tabs'): string {
  const entries = tabs
    .map((tab) => {
      const fields = tab.fieldNames.map((fieldName) => quote(fieldName)).join(', ');
      return `  { name: ${quote(tab.name)}, label: ${quote(tab.label)}, fieldNames: [${fields}], confidence: ${quote(tab.confidence)}, evidence: ${quote(tab.evidence)} }`;
    })
    .join(',\n');

  return `export const ${exportName} = [\n${entries}\n] as const;\n`;
}

function quote(value: string): string {
  return JSON.stringify(value);
}
