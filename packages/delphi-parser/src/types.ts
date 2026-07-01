export interface DelphiFormNode {
  name: string;
  className: string;
  properties: Record<string, string>;
  children: DelphiFormNode[];
}

export interface DelphiFormParseResult {
  root: DelphiFormNode | null;
  warnings: string[];
}

export interface DelphiFieldBinding {
  componentName: string;
  componentClass: string;
  dataSource?: string;
  dataField?: string;
  label?: string;
  section?: string;
}

export interface DelphiActionBinding {
  componentName: string;
  componentClass: string;
  caption?: string;
  event?: string;
  section?: string;
}
