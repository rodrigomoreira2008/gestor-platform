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
  const unassigned: ResolvedField[] = [];

  for (const field of resolved.fields) {
    const section = normalizeSection(field.source?.sectionPath?.join(' > ') ?? field.section);
    if (!section) {
      unassigned.push(field);
      continue;
    }

    const current = grouped.get(section) ?? [];
    if (!current.some((item) => sameName(item.name, field.name))) {
      current.push(field);
    }
    grouped.set(section, current);
  }

  const usedNames = new Set<string>();
  const tabs = Array.from(grouped.entries()).map(([section, fields]) => {
    const baseName = toCamelCase(section) || 'dados';
    const name = uniqueName(baseName, usedNames);
    const explicitSectionPath = fields.some((field) => (field.source?.sectionPath?.length ?? 0) > 0);

    return {
      name,
      label: section.split(' > ').at(-1) ?? section,
      fieldNames: fields.map((field) => field.name),
      confidence: explicitSectionPath ? 'high' as const : 'medium' as const,
      evidence: `${fields.length} campo(s) agrupado(s) pela secao Delphi ${section}`
    };
  });

  if (unassigned.length > 0) {
    tabs.unshift({
      name: uniqueName('dadosGerais', usedNames),
      label: tabs.length > 0 ? 'Dados gerais' : 'Dados',
      fieldNames: unassigned.map((field) => field.name),
      confidence: 'low',
      evidence: `${unassigned.length} campo(s) sem secao Delphi explicita foram preservados em uma aba de fallback.`
    });
  }

  if (tabs.length === 0 && resolved.fields.length > 0) {
    tabs.push({
      name: 'dados',
      label: 'Dados',
      fieldNames: resolved.fields.map((field) => field.name),
      confidence: 'low',
      evidence: 'Fallback criado porque nenhum agrupamento Delphi foi identificado.'
    });
  }

  return tabs;
}

function normalizeSection(value?: string): string | undefined {
  const normalized = value?.split('>').map((part) => part.trim()).filter(Boolean).join(' > ');
  return normalized || undefined;
}

function uniqueName(baseName: string, usedNames: Set<string>): string {
  let candidate = baseName;
  let suffix = 2;
  while (usedNames.has(candidate.toLowerCase())) {
    candidate = `${baseName}${suffix}`;
    suffix += 1;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

function sameName(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
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
