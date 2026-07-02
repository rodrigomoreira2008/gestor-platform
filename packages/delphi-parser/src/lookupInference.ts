import type { ResolvedField, ResolvedForm } from './resolvedForm';

export interface InferredLookup {
  fieldName: string;
  componentName?: string;
  lookupSource?: string;
  keyField?: string;
  displayField?: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

export function inferLookups(resolved: ResolvedForm): InferredLookup[] {
  return resolved.fields
    .filter((field) => isLookupField(field))
    .map((field) => inferLookup(field, resolved));
}

function inferLookup(field: ResolvedField, resolved: ResolvedForm): InferredLookup {
  const component = field.source;
  const lookupSource = component?.dataSource;
  const candidateDataset = resolved.datasets.find((dataset) => dataset.name === lookupSource || dataset.dataSource === lookupSource);
  const relatedRelationship = resolved.relationships.find((relationship) => sameName(relationship.sourceColumn, field.dataField ?? field.name) || sameName(relationship.targetColumn, field.dataField ?? field.name));

  return {
    fieldName: field.name,
    componentName: component?.componentName,
    lookupSource,
    keyField: relatedRelationship?.targetColumn ?? relatedRelationship?.sourceColumn,
    displayField: candidateDataset?.tableName ? 'Descricao' : undefined,
    confidence: relatedRelationship ? relatedRelationship.confidence : lookupSource ? 'medium' : 'low',
    evidence: relatedRelationship?.evidence ?? `Componente ${component?.componentClass ?? 'desconhecido'} com DataSource ${lookupSource ?? 'nao informado'}`
  };
}

function isLookupField(field: ResolvedField): boolean {
  const componentClass = field.source?.componentClass.toLowerCase() ?? '';
  return componentClass.includes('lookup') || componentClass.includes('combo');
}

function sameName(left?: string, right?: string): boolean {
  if (!left || !right) return false;
  return left.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === right.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
