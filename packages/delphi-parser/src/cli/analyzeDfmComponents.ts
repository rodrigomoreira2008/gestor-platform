import { readFileSync } from 'node:fs';
import { listDelphiComponentMappings, mapDelphiComponent } from '../componentMapping';
import { parseDfm } from '../dfmParser';
import type { DelphiFormNode } from '../types';

const [dfmPath] = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const json = process.argv.includes('--json');
const failOnUnknown = process.argv.includes('--fail-on-unknown');
const unknownOnly = process.argv.includes('--unknown-only');

if (!dfmPath) {
  console.error('Uso: analyze:components <arquivo.dfm> [--json] [--unknown-only] [--fail-on-unknown]');
  process.exit(1);
}

const parsed = parseDfm(readFileSync(dfmPath, 'utf8'));
if (!parsed.root) {
  console.error('Nao foi possivel analisar componentes: nenhum objeto raiz foi encontrado no DFM.');
  process.exit(1);
}

const knownClasses = new Set(listDelphiComponentMappings().map((mapping) => mapping.delphiClass.toLowerCase()));
const nodes = flatten(parsed.root);
const classes = nodes.reduce<Record<string, { total: number; role: string; frontendComponent: string; known: boolean; dataBound: number; examples: string[] }>>((summary, node) => {
  const mapping = mapDelphiComponent(node.className);
  const current = summary[node.className] ?? {
    total: 0,
    role: mapping.role,
    frontendComponent: mapping.frontendComponent,
    known: knownClasses.has(node.className.toLowerCase()),
    dataBound: 0,
    examples: []
  };
  current.total += 1;
  if (node.properties.DataField) current.dataBound += 1;
  if (current.examples.length < 5) current.examples.push(node.name);
  summary[node.className] = current;
  return summary;
}, {});

const entries = Object.entries(classes)
  .map(([delphiClass, details]) => ({ delphiClass, ...details }))
  .sort((left, right) => Number(left.known) - Number(right.known) || left.delphiClass.localeCompare(right.delphiClass));
const unknown = entries.filter((entry) => !entry.known);
const displayedEntries = unknownOnly ? unknown : entries;
const result = {
  file: dfmPath,
  totalComponents: nodes.length,
  dataBoundComponents: nodes.filter((node) => Boolean(node.properties.DataField)).length,
  distinctClasses: entries.length,
  unknownClasses: unknown.length,
  warnings: parsed.warnings,
  components: displayedEntries
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`DFM: ${dfmPath}`);
  console.log(`Componentes: ${nodes.length} | Ligados a dados: ${result.dataBoundComponents} | Classes: ${entries.length} | Nao mapeadas: ${unknown.length}`);
  for (const entry of displayedEntries) {
    const status = entry.known ? 'OK' : 'REVISAR';
    const binding = entry.dataBound > 0 ? ` | data-bound: ${entry.dataBound}` : '';
    console.log(`[${status}] ${entry.delphiClass} x${entry.total} => ${entry.role} => ${entry.frontendComponent}${binding} (${entry.examples.join(', ')})`);
  }
  for (const warning of parsed.warnings) console.warn(`Aviso: ${warning}`);
  if (unknownOnly && unknown.length === 0) console.log('Nenhuma classe desconhecida encontrada.');
}

if (failOnUnknown && unknown.length > 0) process.exit(1);

function flatten(root: DelphiFormNode): DelphiFormNode[] {
  return [root, ...root.children.flatMap(flatten)];
}
