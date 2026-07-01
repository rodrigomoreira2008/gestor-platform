import type { GestorFieldType, GestorForm } from '@gestor/dsl';
import { collectActionBindings, collectFieldBindings } from './dfmIntrospection';
import { parseDfm } from './dfmParser';

export interface DfmToGestorFormOptions {
  entity: string;
  title?: string;
  dfmFile?: string;
  pasFile?: string;
  table?: string;
}

export function dfmToGestorForm(input: string, options: DfmToGestorFormOptions): GestorForm {
  const parsed = parseDfm(input);
  if (!parsed.root) throw new Error('DFM sem formulário raiz.');

  const fields = collectFieldBindings(parsed.root).map((field) => ({
    name: normalizeFieldName(field.dataField ?? field.componentName),
    label: field.label ?? field.dataField ?? field.componentName,
    type: mapFieldType(field.componentClass),
    required: false,
    readOnly: field.componentClass === 'TDBGrid',
    section: field.section,
    sourceComponent: field.componentClass,
    sourceBinding: field.dataField
  }));

  const actions = collectActionBindings(parsed.root).map((action) => ({
    name: normalizeFieldName(action.caption ?? action.componentName),
    label: action.caption ?? action.componentName,
    kind: mapActionKind(action.caption ?? action.componentName),
    sourceEvent: action.event
  }));

  return {
    version: '0.1',
    entity: options.entity,
    title: options.title ?? parsed.root.properties.Caption ?? parsed.root.name,
    source: {
      dfm: options.dfmFile,
      pas: options.pasFile
    },
    table: options.table,
    fields,
    actions,
    notes: [
      'DSL gerada automaticamente a partir do parser DFM inicial.',
      ...parsed.warnings.map((warning) => `Aviso do parser: ${warning}`)
    ]
  };
}

function mapFieldType(componentClass: string): GestorFieldType {
  if (componentClass === 'TDBMemo' || componentClass === 'TMemo') return 'memo';
  if (componentClass === 'TDBGrid') return 'grid';
  return 'text';
}

function mapActionKind(label: string): 'create' | 'update' | 'delete' | 'print' | 'custom' {
  const normalized = normalizeFieldName(label);
  if (normalized.includes('novo')) return 'create';
  if (normalized.includes('excluir') || normalized.includes('delete')) return 'delete';
  if (normalized.includes('imprimir') || normalized.includes('print')) return 'print';
  if (normalized.includes('gravar') || normalized.includes('salvar') || normalized.includes('alterar')) return 'update';
  return 'custom';
}

function normalizeFieldName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+(\w)/g, (_, letter: string) => letter.toUpperCase())
    .replace(/^\w/, (letter) => letter.toLowerCase());
}
