import type { InferredBusinessRule } from './businessRuleInference';
import type { ResolvedField, ResolvedNumericConstraint } from './resolvedForm';

export interface BusinessRuleFieldEnrichmentResult {
  fields: ResolvedField[];
  appliedRules: number;
  unmatchedRules: InferredBusinessRule[];
}

export function enrichFieldsWithBusinessRules(fields: ResolvedField[], rules: InferredBusinessRule[]): BusinessRuleFieldEnrichmentResult {
  let appliedRules = 0;
  const unmatchedRules: InferredBusinessRule[] = [];
  const fieldRules = rules.filter((rule) => ['requiredField', 'numericMinimum', 'numericMaximum'].includes(rule.kind) && rule.field);

  const enrichedFields = fields.map((field) => {
    const matches = fieldRules.filter((rule) => fieldMatchesRule(field, rule.field!));
    if (matches.length === 0) return field;

    appliedRules += matches.length;
    const requiredRules = matches.filter((rule) => rule.kind === 'requiredField');
    const messages = matches.map((rule) => rule.message).filter((message): message is string => Boolean(message));
    const minimum = selectNumericConstraint(matches, 'numericMinimum');
    const maximum = selectNumericConstraint(matches, 'numericMaximum');

    return {
      ...field,
      required: field.required || requiredRules.length > 0,
      validationMessages: Array.from(new Set([...field.validationMessages, ...messages])),
      numericMinimum: minimum ?? field.numericMinimum,
      numericMaximum: maximum ?? field.numericMaximum
    };
  });

  for (const rule of fieldRules) {
    if (!fields.some((field) => fieldMatchesRule(field, rule.field!))) unmatchedRules.push(rule);
  }

  return { fields: enrichedFields, appliedRules, unmatchedRules };
}

function selectNumericConstraint(rules: InferredBusinessRule[], kind: 'numericMinimum' | 'numericMaximum'): ResolvedNumericConstraint | undefined {
  const matching = rules.find((rule) => rule.kind === kind && rule.numericValue !== undefined);
  if (!matching || matching.numericValue === undefined) return undefined;
  return { value: matching.numericValue, exclusive: Boolean(matching.exclusive), message: matching.message, sourceNodeId: matching.sourceNodeId };
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
