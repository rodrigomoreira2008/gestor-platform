import { readFileSync } from 'node:fs';
import { mapDelphiComponent } from '../componentMapping';
import { parseDfm } from '../dfmParser';
import type { DelphiFormNode } from '../types';

const [dfmPath] = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const json = process.argv.includes('--json');
const onlyUnknown = process.argv.includes('--unknown');

if (!dfmPath) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser inspect:components <arquivo.dfm> [--unknown] [--json]');
  process.exit(1);
}

const parsed = parseDfm(readFileSync(dfmPath, 'utf8'));
if (!parsed.root) {
  console.error('Nao foi possivel localizar o objeto raiz no DFM. Verifique se o arquivo esta em formato textual.');
  process.exit(1);
}

const nodes = flatten(parsed.root);
const components = nodes.map((node) => {
  const mapping = mapDelphiComponent(node.className);
  return {
    name: node.name,
    delphiClass: node.className,
    role: mapping.role,
    frontendComponent: mapping.frontendComponent,
    mapped: mapping.role !== 'unknown',
    dataField: node.properties.DataField ?? null,
    dataSource: node.properties.DataSource ?? null
  };
});

const filtered = onlyUnknown ? components.filter((component) => !component.mapped) : components;
const classSummary = components.reduce<Record<string, { total: number; mapped: boolean; role: string }>>((summary, component) => {
  const current = summary[component.delphiClass] ?? { total: 0, mapped: component.mapped, role: component.role };
  current.total += 1;
  summary[component.delphiClass] = current;
  return summary;
}, {});
const unknownClasses = Object.entries(classSummary)
  .filter(([, item]) => !item.mapped)
  .map(([className, item]) => ({ className, total: item.total }))
  .sort((left, right) => left.className.localeCompare(right.className));

const result = {
  file: dfmPath,
  totalComponents: components.length,
  mappedComponents: components.filter((component) => component.mapped).length,
  unknownComponents: components.filter((component) => !component.mapped).length,
  unknownClasses,
  warnings: parsed.warnings,
  components: filtered
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Componentes: ${result.totalComponents} | mapeados: ${result.mappedComponents} | desconhecidos: ${result.unknownComponents}`);
  for (const component of filtered) {
    const status = component.mapped ? component.role : 'UNKNOWN';
    const binding = component.dataField ? ` | ${component.dataSource ?? '?'} -> ${component.dataField}` : '';
    console.log(`${component.name}: ${component.delphiClass} => ${status}${binding}`);
  }
  for (const warning of parsed.warnings) console.warn(`Aviso: ${warning}`);
}

if (onlyUnknown && filtered.length === 0) {
  console.log('Nenhum componente desconhecido encontrado.');
}

function flatten(root: DelphiFormNode): DelphiFormNode[] {
  return [root, ...root.children.flatMap(flatten)];
}
