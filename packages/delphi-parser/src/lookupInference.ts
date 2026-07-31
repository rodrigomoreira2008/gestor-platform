import type { ResolvedField, ResolvedForm } from './resolvedForm';

export interface InferredLookup {
  fieldName: string;
  componentName?: string;
  lookupSource?: string;
  keyField?: string;
  displayField?: string;
  endpointHint?: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

const displayFieldCandidates = ['NOME', 'DESCRICAO', 'DESCRICAO_REDUZIDA', 'RAZAO_SOCIAL', 'FANTASIA', 'TITULO', 'LABEL'];
const keyFieldCandidates = ['ID', 'CODIGO', 'CODIGO_ID', 'CONTROLE'];

export function inferLookups(resolved: ResolvedForm): InferredLookup[] {
  const unique = new Map<string, InferredLookup>();
  for (const field of resolved.fields.filter((item) => isLookupField(item))) {
    const lookup = inferLookup(field, resolved);
    unique.set(normalizeName(lookup.fieldName), lookup);
  }
  return Array.from(unique.values());
}

function inferLookup(field: ResolvedField, resolved: ResolvedForm): InferredLookup {
  const component = field.source;
  const lookupSource = component?.listSource ?? inferLookupSourceFromRelationship(field, resolved) ?? component?.dataSource;
  const candidateDataset = resolved.datasets.find((dataset) => sameName(dataset.name, lookupSource) || sameName(dataset.dataSource, lookupSource));
  const relatedRelationship = resolved.relationships.find((relationship) => sameName(relationship.sourceColumn, field.dataField ?? field.name) || sameName(relationship.targetColumn, field.dataField ?? field.name));
  const fieldsForLookup = resolved.fields.filter((candidate) => sameName(candidate.dataSource, lookupSource) || sameName(candidate.source?.dataSource, lookupSource));
  const keyField = component?.keyField ?? relatedRelationship?.targetColumn ?? relatedRelationship?.sourceColumn ?? pickCandidateField(fieldsForLookup, keyFieldCandidates) ?? field.dataField ?? field.name;
  const displayField = component?.listField ?? pickCandidateField(fieldsForLookup, displayFieldCandidates) ?? inferDisplayFieldFromName(field.name) ?? 'descricao';
  const endpointHint = inferEndpointHint(lookupSource, candidateDataset?.tableName, field.name);
  const hasExplicitLookupMetadata = Boolean(component?.listSource && component?.keyField && component?.listField);
  const confidence = hasExplicitLookupMetadata ? 'high' : relatedRelationship ? relatedRelationship.confidence : candidateDataset || fieldsForLookup.length > 0 ? 'medium' : lookupSource ? 'medium' : 'low';

  const evidenceParts = [
    component?.listSource ? `ListSource=${component.listSource}` : undefined,
    component?.keyField ? `KeyField=${component.keyField}` : undefined,
    component?.listField ? `ListField=${component.listField}` : undefined,
    relatedRelationship?.evidence,
    `endpoint=${endpointHint}`
  ].filter(Boolean);

  return {
    fieldName: field.name,
    componentName: component?.componentName,
    lookupSource,
    keyField,
    displayField,
    endpointHint,
    confidence,
    evidence: evidenceParts.join('; ') || `Componente ${component?.componentClass ?? 'desconhecido'}; key=${keyField}; label=${displayField}`
  };
}

function inferLookupSourceFromRelationship(field: ResolvedField, resolved: ResolvedForm): string | undefined {
  const relationship = resolved.relationships.find((item) => sameName(item.sourceColumn, field.dataField ?? field.name));
  return relationship?.targetTable;
}

function inferEndpointHint(lookupSource?: string, tableName?: string, fieldName?: string): string {
  const base = tableName ?? lookupSource ?? fieldName ?? 'lookup';
  const cleaned = base.replace(/^(ds|qry|query|tbl|cds|fdq|ado)/i, '');
  return `/api/${toKebabPlural(cleaned || base)}`;
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

function toKebabPlural(value: string): string {
  const kebab = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}
