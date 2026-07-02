export type DelphiComponentRole =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'grid'
  | 'tabs'
  | 'tree'
  | 'button'
  | 'unknown';

export interface DelphiComponentMapping {
  delphiClass: string;
  role: DelphiComponentRole;
  frontendComponent: string;
  notes?: string;
}

const mappings: DelphiComponentMapping[] = [
  { delphiClass: 'TEdit', role: 'text', frontendComponent: 'TextField' },
  { delphiClass: 'TDBEdit', role: 'text', frontendComponent: 'TextField', notes: 'Campo ligado a DataSource/DataField.' },
  { delphiClass: 'TMaskEdit', role: 'text', frontendComponent: 'TextField', notes: 'Revisar mascara Delphi.' },
  { delphiClass: 'TDBMemo', role: 'text', frontendComponent: 'TextField multiline' },
  { delphiClass: 'TMemo', role: 'text', frontendComponent: 'TextField multiline' },
  { delphiClass: 'TComboBox', role: 'select', frontendComponent: 'Select' },
  { delphiClass: 'TDBComboBox', role: 'select', frontendComponent: 'Select', notes: 'Campo ligado a DataSource/DataField.' },
  { delphiClass: 'TDBLookupComboBox', role: 'select', frontendComponent: 'Autocomplete', notes: 'Requer inferencia de lookup.' },
  { delphiClass: 'TCheckBox', role: 'checkbox', frontendComponent: 'Checkbox' },
  { delphiClass: 'TDBCheckBox', role: 'checkbox', frontendComponent: 'Checkbox', notes: 'Campo ligado a DataSource/DataField.' },
  { delphiClass: 'TRadioGroup', role: 'radio', frontendComponent: 'RadioGroup' },
  { delphiClass: 'TDateTimePicker', role: 'date', frontendComponent: 'DatePicker' },
  { delphiClass: 'TDBGrid', role: 'grid', frontendComponent: 'DataGrid' },
  { delphiClass: 'TStringGrid', role: 'grid', frontendComponent: 'DataGrid' },
  { delphiClass: 'TPageControl', role: 'tabs', frontendComponent: 'Tabs' },
  { delphiClass: 'TTabSheet', role: 'tabs', frontendComponent: 'TabPanel' },
  { delphiClass: 'TTreeView', role: 'tree', frontendComponent: 'TreeView' },
  { delphiClass: 'TButton', role: 'button', frontendComponent: 'Button' },
  { delphiClass: 'TBitBtn', role: 'button', frontendComponent: 'Button' },
  { delphiClass: 'TSpeedButton', role: 'button', frontendComponent: 'IconButton' }
];

export function mapDelphiComponent(delphiClass?: string): DelphiComponentMapping {
  const mapping = mappings.find((item) => sameName(item.delphiClass, delphiClass ?? ''));
  return mapping ?? { delphiClass: delphiClass ?? 'unknown', role: 'unknown', frontendComponent: 'TextField', notes: 'Mapeamento nao conhecido; revisar manualmente.' };
}

export function listDelphiComponentMappings(): DelphiComponentMapping[] {
  return [...mappings];
}

function sameName(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}
