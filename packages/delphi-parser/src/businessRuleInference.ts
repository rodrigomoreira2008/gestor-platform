import type { PascalFlowNode, PascalMethodFlow } from './pasParser';

export type InferredBusinessRuleKind =
  | 'requiredField'
  | 'ensureDatasetOpen'
  | 'saveDataset'
  | 'deleteRecord'
  | 'closeForm'
  | 'showMessage'
  | 'assignment'
  | 'customCall';

export interface InferredBusinessRule {
  methodName: string;
  kind: InferredBusinessRuleKind;
  confidence: 'high' | 'medium';
  sourceNodeId: string;
  condition?: string;
  target?: string;
  field?: string;
  message?: string;
  expression?: string;
}

export function inferBusinessRules(flows: PascalMethodFlow[]): InferredBusinessRule[] {
  return flows.flatMap((flow) => inferFlowRules(flow));
}

function inferFlowRules(flow: PascalMethodFlow): InferredBusinessRule[] {
  const rules: InferredBusinessRule[] = [];
  visitNodes(flow.nodes, undefined, flow.methodName, rules);
  return rules;
}

function visitNodes(nodes: PascalFlowNode[], condition: string | undefined, methodName: string, rules: InferredBusinessRule[]): void {
  for (const node of nodes) {
    const activeCondition = node.kind === 'if' ? node.expression : condition;

    if (node.kind === 'if') {
      const requiredField = inferRequiredField(node.expression);
      const message = findMessage(node.children);
      const aborts = node.children.some((child) => child.kind === 'abort');
      if (requiredField && (message || aborts)) {
        rules.push({
          methodName,
          kind: 'requiredField',
          confidence: message && aborts ? 'high' : 'medium',
          sourceNodeId: node.id,
          condition: node.expression,
          field: requiredField,
          message
        });
      }
      visitNodes(node.children, activeCondition, methodName, rules);
      for (const alternate of node.alternate ?? []) visitNodes(alternate.children, `not (${node.expression ?? ''})`, methodName, rules);
      continue;
    }

    if (node.kind === 'message') {
      rules.push({ methodName, kind: 'showMessage', confidence: 'high', sourceNodeId: node.id, condition, target: node.target, message: unquote(node.expression) });
      continue;
    }

    if (node.kind === 'assignment') {
      rules.push({ methodName, kind: 'assignment', confidence: 'high', sourceNodeId: node.id, condition, target: node.target, expression: node.expression });
      continue;
    }

    if (node.kind !== 'call' || !node.target) continue;
    const target = node.target;
    if (/\.Open$/i.test(target)) rules.push(rule(methodName, node, 'ensureDatasetOpen', condition, target.replace(/\.Open$/i, '')));
    else if (/\.Post$/i.test(target)) rules.push(rule(methodName, node, 'saveDataset', condition, target.replace(/\.Post$/i, '')));
    else if (/\.Delete$/i.test(target)) rules.push(rule(methodName, node, 'deleteRecord', condition, target.replace(/\.Delete$/i, '')));
    else if (/^(Close|Self\.Close)$/i.test(target)) rules.push(rule(methodName, node, 'closeForm', condition, target));
    else rules.push(rule(methodName, node, 'customCall', condition, target, node.expression));
  }
}

function rule(methodName: string, node: PascalFlowNode, kind: InferredBusinessRuleKind, condition?: string, target?: string, expression?: string): InferredBusinessRule {
  return { methodName, kind, confidence: 'high', sourceNodeId: node.id, condition, target, expression };
}

function inferRequiredField(expression?: string): string | undefined {
  if (!expression) return undefined;
  const fieldByName = expression.match(/FieldByName\s*\(\s*'([^']+)'\s*\)\.(?:IsNull|AsString\s*=\s*'')/i);
  if (fieldByName) return fieldByName[1];
  const control = expression.match(/\b([A-Za-z_]\w*)\.(?:Text|EditText)\s*=\s*''/i);
  return control?.[1];
}

function findMessage(nodes: PascalFlowNode[]): string | undefined {
  const message = nodes.find((node) => node.kind === 'message');
  return message ? unquote(message.expression) : undefined;
}

function unquote(value?: string): string | undefined {
  if (!value) return value;
  return value.trim().replace(/^'|'$/g, '').replace(/''/g, "'");
}
