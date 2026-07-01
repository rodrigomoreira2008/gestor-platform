import type { DelphiActionBinding, DelphiFieldBinding, DelphiFormNode } from './types';

const fieldClasses = new Set(['TDBEdit', 'TDBComboBox', 'TDBMemo', 'TDBGrid', 'TEdit', 'TComboBox', 'TMemo', 'TMaskEdit']);
const buttonClasses = new Set(['TBitBtn', 'TSpeedButton', 'TButton']);
const sectionClasses = new Set(['TGroupBox', 'TTabSheet', 'TPanel']);

export function collectFieldBindings(root: DelphiFormNode): DelphiFieldBinding[] {
  const result: DelphiFieldBinding[] = [];
  walk(root, [], (node, parents) => {
    if (!fieldClasses.has(node.className)) return;

    result.push({
      componentName: node.name,
      componentClass: node.className,
      dataSource: node.properties.DataSource,
      dataField: node.properties.DataField,
      label: node.properties.Caption,
      section: findNearestSection(parents)
    });
  });
  return result;
}

export function collectActionBindings(root: DelphiFormNode): DelphiActionBinding[] {
  const result: DelphiActionBinding[] = [];
  walk(root, [], (node, parents) => {
    if (!buttonClasses.has(node.className)) return;

    result.push({
      componentName: node.name,
      componentClass: node.className,
      caption: node.properties.Caption,
      event: node.properties.OnClick,
      section: findNearestSection(parents)
    });
  });
  return result;
}

function walk(node: DelphiFormNode, parents: DelphiFormNode[], visit: (node: DelphiFormNode, parents: DelphiFormNode[]) => void): void {
  visit(node, parents);
  for (const child of node.children) walk(child, [...parents, node], visit);
}

function findNearestSection(parents: DelphiFormNode[]): string | undefined {
  const section = [...parents].reverse().find((parent) => sectionClasses.has(parent.className) && parent.properties.Caption);
  return section?.properties.Caption;
}
