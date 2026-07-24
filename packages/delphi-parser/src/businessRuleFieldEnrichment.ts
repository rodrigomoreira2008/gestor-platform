import type { InferredBusinessRule } from './businessRuleInference';
import type { ResolvedField } from './resolvedForm';

export interface BusinessRuleFieldEnrichmentResult {
  fields: ResolvedField[];
  appliedRules: number;
  unmatchedRules: InferredBusinessRule[];
}

export function enrichFieldsWithBusinessRules(fields: ResolvedField[], rules: InferredBusinessRule[]): BusinessRuleFieldEnrichmentResult {
  let appliedRules = 0;
  const unmatchedRules: InferredBusinessRule[] = [];
  const requiredRules = rules.filter((rule) => rule.kind === 'requiredField' && rule.field);

  const enrichedFields = fields.map((field) => {
    const matches = requiredRules.filter((rule) => fieldMatchesRule(field, rule.field!));
    if (matches.length === 0) return field;

    appliedRules += matches.length;
    const messages = matches.map((rule) => rule.message).filter((message): message is string => Boolean(message));
    return {
      ...field,
      required: true,
      validationMessages: Array.from(new Set([...field.validationMessages, ...messages]))
    };
  });

  for (const rule of requiredRules) {
    if (!fields.some((field) => fieldMatchesRule(field, rule.field!))) unmatchedRules.push(rule);
  }

  return { fields: enrichedFields, appliedRules, unmatchedRules };
}

function fieldMatchesRule(field: ResolvedField, ruleField: string): boolean {
  const candidates = [field.name, field.dataField, field.source?.componentName].filter(Boolean).map((value) => normalizeName(String(value)));
  const normalizedRule = normalizeName(ruleField);
  if (candidates.includes(normalizedRule)) return true;

  const strippedRule = normalizedRule.replace(/^(edt|dbedt|txt|cmb|cb|lkp|lookup|mem|memo)/, '');
  return candidates.some((candidate) => candidate === strippedRule || candidate.replace(/^(edt|dbedt|txt|cmb|cb|lkp|lookup|mem|memo)/, '') === strippedRule);
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}
