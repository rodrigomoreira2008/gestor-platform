import type { DelphiActionBinding, DelphiBounds, DelphiFieldBinding, DelphiFormNode } from './types';

const fieldClasses = new Set([
  'TDBEdit', 'TDBComboBox', 'TDBLookupComboBox', 'TDBLookupCombo', 'TDBMemo', 'TDBGrid', 'TDBGridEh',
  'TDBCheckBox', 'TDBRadioGroup', 'TDBDateTimePicker', 'TDBNumberEdit',
  'TEdit', 'TComboBox', 'TMemo', 'TMaskEdit', 'TCheckBox', 'TRadioGroup', 'TDateTimePicker', 'TSpinEdit', 'TStringGrid'
]);
const buttonClasses = new Set(['TBitBtn', 'TSpeedButton', 'TButton']);
const labelClasses = new Set(['TLabel']);
const sectionClasses = new Set(['TGroupBox', 'TTabSheet', 'TcxTabSheet', 'TPanel']);

export function collectFieldBindings(root: DelphiFormNode): DelphiFieldBinding[] {
  const result: DelphiFieldBinding[] = [];
  walk(root, [], (node, parents) => {
    if (!fieldClasses.has(node.className)) return;

    const sectionPath = findSectionPath(parents);

    result.push({
      componentName: node.name,
      componentClass: node.className,
      dataSource: node.properties.DataSource,
      dataField: node.properties.DataField,
      listSource: node.properties.ListSource,
      keyField: node.properties.KeyField,
      listField: node.properties.ListField,
      label: node.properties.Caption ?? findNearbyLabel(node, parents.at(-1)),
      section: sectionPath.at(-1),
      sectionPath,
      bounds: readBounds(node)
    });
  });
  return result;
}

export function collectActionBindings(root: DelphiFormNode): DelphiActionBinding[] {
  const result: DelphiActionBinding[] = [];
  walk(root, [], (node, parents) => {
    if (!buttonClasses.has(node.className)) return;

    const sectionPath = findSectionPath(parents);

    result.push({
      componentName: node.name,
      componentClass: node.className,
      caption: node.properties.Caption,
      event: node.properties.OnClick,
      section: sectionPath.at(-1),
      sectionPath,
      bounds: readBounds(node)
    });
  });
  return result;
}

function walk(node: DelphiFormNode, parents: DelphiFormNode[], visit: (node: DelphiFormNode, parents: DelphiFormNode[]) => void): void {
  visit(node, parents);
  for (const child of node.children) walk(child, [...parents, node], visit);
}

function findSectionPath(parents: DelphiFormNode[]): string[] {
  return parents
    .filter((parent) => sectionClasses.has(parent.className) && parent.properties.Caption)
    .map((parent) => parent.properties.Caption);
}

function findNearbyLabel(field: DelphiFormNode, parent?: DelphiFormNode): string | undefined {
  if (!parent) return undefined;

  const fieldBounds = readBounds(field);
  if (fieldBounds.left === undefined || fieldBounds.top === undefined) return undefined;

  const labels = parent.children
    .filter((child) => labelClasses.has(child.className) && child.properties.Caption)
    .map((label) => ({ label, bounds: readBounds(label) }))
    .filter((entry) => entry.bounds.left !== undefined && entry.bounds.top !== undefined);

  const candidates = labels
    .map((entry) => ({ caption: entry.label.properties.Caption, score: scoreLabelCandidate(fieldBounds, entry.bounds) }))
    .filter((entry) => entry.score < Number.POSITIVE_INFINITY)
    .sort((a, b) => a.score - b.score);

  return candidates[0]?.caption;
}

function scoreLabelCandidate(field: DelphiBounds, label: DelphiBounds): number {
  if (label.left === undefined || label.top === undefined || field.left === undefined || field.top === undefined) return Number.POSITIVE_INFINITY;
  const verticalDistance = Math.abs(field.top - label.top);
  const horizontalDistance = Math.abs(field.left - label.left);
  const isAbove = label.top <= field.top;
  const isLeftAligned = label.left <= field.left + 24;
  if (!isAbove || verticalDistance > 32 || !isLeftAligned) return Number.POSITIVE_INFINITY;
  return verticalDistance * 10 + horizontalDistance;
}

function readBounds(node: DelphiFormNode): DelphiBounds {
  return {
    left: readNumber(node.properties.Left),
    top: readNumber(node.properties.Top),
    width: readNumber(node.properties.Width),
    height: readNumber(node.properties.Height)
  };
}

function readNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}
