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

const displayFieldCandidates = ['NOME', 'DESCRICAO', 'DESCRICAO_REDUZIDA', 'RAZAO_SOCIAL', 'FANTASIA', 'TITULO', 'LABEL'];
const keyFieldCandidates = ['ID', 'CODIGO', 'CODIGO_ID', 'CONTROLE'];

export function inferLookups(resolved: ResolvedForm): InferredLookup[] {
  return resolved.fields
    .filter((field) => isLookupField(field))
    .map((field) => inferLookup(field, resolved));
}

function inferLookup(field: ResolvedField, resolved: ResolvedForm): InferredLookup {
  const component = field.source;
  const lookupSource = component?.dataSource;
  const candidateDataset = resolved.datasets.find((dataset) => sameName(dataset.name, lookupSource) || sameName(dataset.dataSource, lookupSource));
  const relatedRelationship = resolved.relationships.find((relationship) => sameName(relationship.sourceColumn, field.dataField ?? field.name) || sameName(relationship.targetColumn, field.dataField ?? field.name));
  const fieldsForLookup = resolved.fields.filter((candidate) => sameName(candidate.dataSource, lookupSource));
  const keyField = relatedRelationship?.targetColumn ?? relatedRelationship?.sourceColumn ?? pickCandidateField(fieldsForLookup, keyFieldCandidates) ?? field.dataField ?? field.name;
  const displayField = pickCandidateField(fieldsForLookup, displayFieldCandidates) ?? inferDisplayFieldFromName(field.name) ?? 'descricao';
  const confidence = relatedRelationship ? relatedRelationship.confidence : candidateDataset || fieldsForLookup.length > 0 ? 'medium' : lookupSource ? 'medium' : 'low';

  return {
    fieldName: field.name,
    componentName: component?.componentName,
    lookupSource,
    keyField,
    displayField,
    confidence,
    evidence: relatedRelationship?.evidence ?? `Componente ${component?.componentClass ?? 'desconhecido'} com DataSource ${lookupSource ?? 'nao informado'}; key=${keyField}; label=${displayField}`
  };
}

function pickCandidateField(fields: ResolvedField[], candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const found = fields.find((field) => sameName(field.dataField ?? field.name, candidate));
    if (found) return found.dataField ?? found.name;
  }

  return undefined;
}

function inferDisplayFieldFromName(fieldName: string): string | undefined {
  const normalized = normalizeName(fieldName);
  if (normalized.includes('grupo')) return 'NOME';
  if (normalized.includes('produto')) return 'NOME';
  if (normalized.includes('parceiro') || normalized.includes('cliente') || normalized.includes('fornecedor')) return 'NOME';
  if (normalized.includes('cidade') || normalized.includes('estado') || normalized.includes('pais')) return 'NOME';
  return undefined;
}

function isLookupField(field: ResolvedField): boolean {
  const componentClass = field.source?.componentClass.toLowerCase() ?? '';
  return componentClass.includes('lookup') || componentClass.includes('combo');
}

function sameName(left?: string, right?: string): boolean {
  if (!left || !right) return false;
  return normalizeName(left) === normalizeName(right);
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}
