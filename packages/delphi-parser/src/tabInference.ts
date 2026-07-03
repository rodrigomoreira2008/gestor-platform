import type { ResolvedField, ResolvedForm } from './resolvedForm';

export interface InferredTab {
  name: string;
  label: string;
  fieldNames: string[];
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

export function inferTabs(resolved: ResolvedForm): InferredTab[] {
  const grouped = new Map<string, ResolvedField[]>();

  for (const field of resolved.fields) {
    const section = field.source?.sectionPath?.join(' > ') ?? field.section;
    if (!section) continue;
    const current = grouped.get(section) ?? [];
    current.push(field);
    grouped.set(section, current);
  }

  return Array.from(grouped.entries()).map(([section, fields]) => ({
    name: toCamelCase(section),
    label: section.split(' > ').at(-1) ?? section,
    fieldNames: fields.map((field) => field.name),
    confidence: fields.some((field) => field.source?.sectionPath && field.source.sectionPath.length > 0) ? 'high' : 'medium',
    evidence: `${fields.length} campo(s) agrupado(s) pela secao Delphi ${section}`
  }));
}

function toPascalCase(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
