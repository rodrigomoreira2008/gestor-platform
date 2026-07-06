import type { ResolvedForm } from './resolvedForm';

export interface InferredDetailGrid {
  name: string;
  componentName?: string;
  dataSource?: string;
  fieldNames: string[];
  relationship?: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

export function inferDetailGrids(resolved: ResolvedForm): InferredDetailGrid[] {
  const gridFields = resolved.fields.filter((field) => isGridComponent(field.source?.componentClass));
  const dataSources = new Set(gridFields.map((field) => field.dataSource ?? field.source?.dataSource).filter(Boolean) as string[]);

  return Array.from(dataSources).map((dataSource) => inferDetailGrid(dataSource, resolved));
}

function inferDetailGrid(dataSource: string, resolved: ResolvedForm): InferredDetailGrid {
  const fields = resolved.fields.filter((field) => sameName(field.dataSource, dataSource) || sameName(field.source?.dataSource, dataSource));
  const relationship = resolved.relationships.find((item) => fields.some((field) => sameName(field.dataField ?? field.name, item.sourceColumn) || sameName(field.dataField ?? field.name, item.targetColumn)));

  return {
    name: toCamelCase(dataSource),
    componentName: fields.find((field) => isGridComponent(field.source?.componentClass))?.source?.componentName,
    dataSource,
    fieldNames: fields.map((field) => field.name),
    relationship: relationship ? `${relationship.sourceTable}.${relationship.sourceColumn} -> ${relationship.targetTable}.${relationship.targetColumn}` : undefined,
    confidence: relationship ? relationship.confidence : fields.length > 0 ? 'medium' : 'low',
    evidence: relationship?.evidence ?? `${fields.length} campo(s) associados ao DataSource ${dataSource}`
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

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
