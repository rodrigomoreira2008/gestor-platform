import type { GestorField, GestorForm } from '@gestor/dsl';
import type { DfmComponent, DfmParseResult } from './types.js';

const FIELD_COMPONENTS = new Set([
  'TEdit',
  'TDBEdit',
  'TMemo',
  'TDBMemo',
  'TComboBox',
  'TDBComboBox',
  'TDBLookupComboBox',
  'TDateTimePicker',
  'TDBGrid',
  'TCheckBox',
  'TDBCheckBox'
]);

export function dfmToGestorForm(parseResult: DfmParseResult, sourceFile?: string): GestorForm {
  const root = parseResult.root;

  const fields = parseResult.components
    .filter((component) => FIELD_COMPONENTS.has(component.className))
    .map(componentToField);

  return {
    version: '0.1',
    entity: normalizeEntityName(root?.name ?? sourceFile ?? 'unknown'),
    title: root?.properties.Caption ?? root?.name ?? sourceFile ?? 'Tela sem título',
    source: {
      dfm: sourceFile
    },
    fields,
    actions: [],
    notes: parseResult.warnings
  };
}

function componentToField(component: DfmComponent): GestorField {
  return {
    name: normalizeEntityName(component.properties.DataField ?? component.name),
    label: component.properties.Caption ?? component.properties.Hint ?? component.name,
    type: inferFieldType(component),
    required: false,
    readOnly: component.properties.ReadOnly === 'True',
    sourceComponent: component.className,
    sourceBinding: component.properties.DataField
  };
}

function inferFieldType(component: DfmComponent): GestorField['type'] {
  if (component.className.includes('Grid')) return 'grid';
  if (component.className.includes('Memo')) return 'memo';
  if (component.className.includes('Lookup')) return 'lookup';
  if (component.className.includes('CheckBox')) return 'boolean';
  if (component.className.includes('Date')) return 'date';

  const name = `${component.name} ${component.properties.DataField ?? ''}`.toLowerCase();

  if (name.includes('valor') || name.includes('preco') || name.includes('total')) return 'money';
  if (name.includes('data')) return 'date';
  if (name.includes('hora')) return 'datetime';
  if (name.includes('codigo') || name.includes('id_') || name === 'id') return 'integer';

  return 'text';
}

function normalizeEntityName(value: string): string {
  return value
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}
