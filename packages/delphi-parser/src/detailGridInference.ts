import type { ResolvedField, ResolvedForm } from './resolvedForm';

export interface InferredDetailGrid {
  name: string;
  label: string;
  componentName?: string;
  dataSource?: string;
  fieldNames: string[];
  relationship?: string;
  masterField?: string;
  detailField?: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

export function inferDetailGrids(resolved: ResolvedForm): InferredDetailGrid[] {
  const gridFields = resolved.fields.filter((field) => isGridComponent(field.source?.componentClass));
  const dataSources = unique(gridFields.map((field) => field.dataSource ?? field.source?.dataSource).filter(Boolean) as string[]);

  return dataSources.map((dataSource) => inferDetailGrid(dataSource, resolved));
}

function inferDetailGrid(dataSource: string, resolved: ResolvedForm): InferredDetailGrid {
  const fields = resolved.fields.filter((field) => sameName(field.dataSource, dataSource) || sameName(field.source?.dataSource, dataSource));
  const gridField = fields.find((field) => isGridComponent(field.source?.componentClass));
  const relationship = resolved.relationships.find((item) => fields.some((field) => sameName(field.dataField ?? field.name, item.sourceColumn) || sameName(field.dataField ?? field.name, item.targetColumn)));
  const visibleFields = unique(fields.filter((field) => !isGridComponent(field.source?.componentClass)).map((field) => field.name));
  const fallbackFields = unique(fields.map((field) => field.dataField ?? field.name).filter(Boolean));
  const fieldNames = visibleFields.length > 0 ? visibleFields : fallbackFields.filter((field) => !sameName(field, gridField?.name));
  const componentName = gridField?.source?.componentName;

  return {
    name: toCamelCase(componentName ?? dataSource),
    label: humanize(componentName ?? dataSource),
    componentName,
    dataSource,
    fieldNames,
    relationship: relationship ? `${relationship.sourceTable}.${relationship.sourceColumn} -> ${relationship.targetTable}.${relationship.targetColumn}` : undefined,
    masterField: relationship?.targetColumn,
    detailField: relationship?.sourceColumn,
    confidence: relationship ? relationship.confidence : fieldNames.length > 0 ? 'medium' : 'low',
    evidence: relationship?.evidence ?? `${fieldNames.length} campo(s) de detalhe associados ao DataSource ${dataSource}`
  };
}

function isGridComponent(componentClass?: string): boolean {
  const normalized = componentClass?.toLowerCase() ?? '';
  return normalized.includes('grid');
}

function sameName(left?: string, right?: string): boolean {
  if (!left || !right) return false;
  return normalizeName(left) === normalizeName(right);
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalizeName(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function humanize(value: string): string {
  const withoutPrefix = value.replace(/^(grid|dbg|grd|ds)/i, '');
  const words = withoutPrefix.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Detalhes';
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
