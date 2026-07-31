import type { MethodActionPlan, MethodActionStep } from './methodActionPlanning';

export interface FrontendMethodActionGeneratorOptions {
  entityPascal: string;
  entity: string;
}

export function renderFrontendMethodActionAdapters(plans: MethodActionPlan[], options: FrontendMethodActionGeneratorOptions): string {
  const renderedPlans = plans.map((plan) => renderPlan(plan, options)).join('\n\n');
  return `import type { ${options.entityPascal}Input } from '../types/${options.entity}';

export interface DelphiActionRuntime {
  save: (input: ${options.entityPascal}Input) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
  openDataset?: (dataset: string) => Promise<unknown> | unknown;
  close?: () => void;
  notify?: (message: string) => void;
  invoke?: (target: string, expression?: string) => Promise<unknown> | unknown;
}

export interface DelphiActionContext {
  input: ${options.entityPascal}Input;
  id?: number;
}

${renderedPlans || '// Nenhum plano de ação Delphi inferido.'}
`;
}

function renderPlan(plan: MethodActionPlan, options: FrontendMethodActionGeneratorOptions): string {
  const functionName = `execute${sanitizeMethodName(plan.methodName)}`;
  const statements = plan.steps.map((step) => renderStep(step)).filter(Boolean).join('\n');
  const reviewTargets = plan.steps.filter((step) => step.requiresReview).map((step) => step.target ?? step.sourceRuleKind);
  const reviewComment = reviewTargets.length > 0 ? `  // Revisar chamadas Delphi: ${reviewTargets.join(', ')}\n` : '';
  return `export async function ${functionName}(runtime: DelphiActionRuntime, context: DelphiActionContext): Promise<void> {
${reviewComment}${statements || '  // Nenhuma ação executável inferida.'}
}`;
}

function renderStep(step: MethodActionStep): string {
  const prefix = step.condition ? `  // Condição Pascal: ${escapeComment(step.condition)}\n` : '';
  switch (step.kind) {
    case 'validate':
      return `${prefix}  // Validação de ${step.field ?? 'campo'} aplicada pelo schema gerado.`;
    case 'openDataset':
      return `${prefix}  if (runtime.openDataset) await runtime.openDataset('${escapeSingleQuote(step.target ?? '')}');`;
    case 'save':
      return `${prefix}  await runtime.save(context.input);`;
    case 'delete':
      return `${prefix}  if (context.id === undefined) throw new Error('Identificador obrigatório para exclusão.');\n  await runtime.remove(context.id);`;
    case 'message':
      return `${prefix}  runtime.notify?.('${escapeSingleQuote(step.message ?? 'Operação concluída.')}');`;
    case 'assign':
      return `${prefix}  // Atribuição Delphi para revisão: ${escapeComment(step.target ?? '')} := ${escapeComment(step.expression ?? '')}`;
    case 'invoke':
      return `${prefix}  if (runtime.invoke) await runtime.invoke('${escapeSingleQuote(step.target ?? '')}', ${step.expression ? `'${escapeSingleQuote(step.expression)}'` : 'undefined'});`;
    case 'close':
      return `${prefix}  runtime.close?.();`;
  }
}

function sanitizeMethodName(value: string): string {
  const parts = value.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const pascal = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return pascal || 'DelphiAction';
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}

function escapeComment(value: string): string {
  return value.replace(/\r?\n/g, ' ').replace(/\*\//g, '* /').trim();
}
