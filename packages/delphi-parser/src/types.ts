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

export interface DelphiBounds {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

export interface DelphiFieldBinding {
  componentName: string;
  componentClass: string;
  dataSource?: string;
  dataField?: string;
  label?: string;
  section?: string;
  sectionPath?: string[];
  bounds?: DelphiBounds;
}

export interface DelphiActionBinding {
  componentName: string;
  componentClass: string;
  caption?: string;
  event?: string;
  section?: string;
  sectionPath?: string[];
  bounds?: DelphiBounds;
}
