import type { MethodActionPlan } from './methodActionPlanning';
import type { ResolvedAction } from './resolvedForm';

export interface FrontendDelphiActionControllerOptions {
  entityPascal: string;
  entity: string;
}

interface ActionExecutionBinding {
  componentName: string;
  handlerName: string;
  executorName: string;
  actionKind: string;
  label?: string;
}

export function renderFrontendDelphiActionController(
  actions: ResolvedAction[],
  plans: MethodActionPlan[],
  options: FrontendDelphiActionControllerOptions
): string {
  const bindings = buildBindings(actions, plans);
  const imports = bindings.map((binding) => binding.executorName).filter((value, index, values) => values.indexOf(value) === index);
  const handlerProperties = bindings.map((binding) => renderHandlerProperty(binding)).join(',\n');
  const metadataEntries = bindings.map((binding) => `  ${safeProperty(binding.componentName)}: { componentName: '${escapeSingleQuote(binding.componentName)}', handlerName: '${escapeSingleQuote(binding.handlerName)}', kind: '${escapeSingleQuote(binding.actionKind)}', label: ${binding.label ? `'${escapeSingleQuote(binding.label)}'` : 'undefined'} }`).join(',\n');
  const unmatched = actions.filter((action) => action.event?.handlerName && !bindings.some((binding) => sameName(binding.componentName, action.name)));
  const unmatchedComments = unmatched.map((action) => `// Evento sem plano executável: ${escapeComment(action.name)}.${escapeComment(action.event?.eventName ?? 'evento')} -> ${escapeComment(action.event?.handlerName ?? '')}`).join('\n');

  return `import { useMemo } from 'react';
import type { ${options.entityPascal}Input } from '../types/${options.entity}';
import { use${options.entityPascal}DelphiRuntime, type ${options.entityPascal}DelphiRuntimeOptions } from './use${options.entityPascal}DelphiRuntime';
${imports.length > 0 ? `import { ${imports.join(', ')} } from './${options.entity}DelphiActions';` : ''}

export interface ${options.entityPascal}DelphiActionControllerOptions extends ${options.entityPascal}DelphiRuntimeOptions {
  input: ${options.entityPascal}Input;
}

export interface ${options.entityPascal}DelphiActionHandlers {
${bindings.map((binding) => `  ${safeProperty(binding.componentName)}: () => Promise<void>;`).join('\n') || '  // Nenhum evento DFM associado a um plano executável.'}
}

export const ${options.entity}DelphiActionMetadata = {
${metadataEntries}
} as const;

export function use${options.entityPascal}DelphiActionController(options: ${options.entityPascal}DelphiActionControllerOptions): ${options.entityPascal}DelphiActionHandlers {
  const runtime = use${options.entityPascal}DelphiRuntime(options);
  return useMemo(() => ({
${handlerProperties || '    // Nenhum handler Delphi gerado.'}
  }), [runtime, options.input, options.id]);
}

${unmatchedComments}
`;
}

function buildBindings(actions: ResolvedAction[], plans: MethodActionPlan[]): ActionExecutionBinding[] {
  const bindings: ActionExecutionBinding[] = [];

  for (const action of actions) {
    const handlerName = action.event?.handlerName;
    if (!handlerName) continue;
    const plan = plans.find((candidate) => methodMatchesHandler(candidate.methodName, handlerName));
    if (!plan) continue;

    bindings.push({
      componentName: action.name,
      handlerName,
      executorName: `execute${sanitizeMethodName(plan.methodName)}`,
      actionKind: action.kind ?? 'custom',
      label: action.label
    });
  }

  return bindings;
}

function renderHandlerProperty(binding: ActionExecutionBinding): string {
  return `    ${safeProperty(binding.componentName)}: () => ${binding.executorName}(runtime, { input: options.input, id: options.id })`;
}

function methodMatchesHandler(methodName: string, handlerName: string): boolean {
  const method = normalizeName(methodName);
  const handler = normalizeName(handlerName);
  return method === handler || method.endsWith(handler);
}

function sanitizeMethodName(value: string): string {
  const parts = value.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const pascal = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return pascal || 'DelphiAction';
}

function safeProperty(value: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) ? value : `'${escapeSingleQuote(value)}'`;
}

function sameName(left: string, right: string): boolean {
  return normalizeName(left) === normalizeName(right);
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}

function escapeComment(value: string): string {
  return value.replace(/\r?\n/g, ' ').replace(/\*\//g, '* /').trim();
}
