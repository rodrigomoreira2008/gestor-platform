import type { InferredBusinessRule } from './businessRuleInference';

export type MethodActionKind =
  | 'validate'
  | 'openDataset'
  | 'save'
  | 'delete'
  | 'message'
  | 'assign'
  | 'invoke'
  | 'close';

export interface MethodActionStep {
  order: number;
  kind: MethodActionKind;
  sourceRuleKind: InferredBusinessRule['kind'];
  sourceNodeId: string;
  condition?: string;
  target?: string;
  field?: string;
  message?: string;
  expression?: string;
  requiresReview: boolean;
}

export interface MethodActionPlan {
  methodName: string;
  steps: MethodActionStep[];
  hasPersistence: boolean;
  hasDestructiveAction: boolean;
  requiresReview: boolean;
}

export function buildMethodActionPlans(rules: InferredBusinessRule[]): MethodActionPlan[] {
  const grouped = new Map<string, InferredBusinessRule[]>();
  for (const rule of rules) {
    const list = grouped.get(rule.methodName) ?? [];
    list.push(rule);
    grouped.set(rule.methodName, list);
  }

  return Array.from(grouped.entries()).map(([methodName, methodRules]) => {
    const steps = methodRules.map((rule, index) => toActionStep(rule, index + 1));
    return {
      methodName,
      steps,
      hasPersistence: steps.some((step) => step.kind === 'save'),
      hasDestructiveAction: steps.some((step) => step.kind === 'delete'),
      requiresReview: steps.some((step) => step.requiresReview)
    };
  });
}

function toActionStep(rule: InferredBusinessRule, order: number): MethodActionStep {
  const mapped = mapRuleKind(rule.kind);
  return {
    order,
    kind: mapped.kind,
    sourceRuleKind: rule.kind,
    sourceNodeId: rule.sourceNodeId,
    condition: rule.condition,
    target: rule.target,
    field: rule.field,
    message: rule.message,
    expression: rule.expression,
    requiresReview: mapped.requiresReview
  };
}

function mapRuleKind(kind: InferredBusinessRule['kind']): Pick<MethodActionStep, 'kind' | 'requiresReview'> {
  switch (kind) {
    case 'requiredField':
    case 'numericMinimum':
    case 'numericMaximum':
      return { kind: 'validate', requiresReview: false };
    case 'ensureDatasetOpen':
      return { kind: 'openDataset', requiresReview: false };
    case 'saveDataset':
      return { kind: 'save', requiresReview: false };
    case 'deleteRecord':
      return { kind: 'delete', requiresReview: false };
    case 'showMessage':
      return { kind: 'message', requiresReview: false };
    case 'assignment':
      return { kind: 'assign', requiresReview: true };
    case 'closeForm':
      return { kind: 'close', requiresReview: false };
    case 'customCall':
      return { kind: 'invoke', requiresReview: true };
  }
}
