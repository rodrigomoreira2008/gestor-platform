import type { MethodActionPlan } from './methodActionPlanning';
import type { ResolvedAction } from './resolvedForm';

export interface FrontendDelphiDialogControllerOptions {
  entityPascal: string;
  entity: string;
}

export function renderFrontendDelphiDialogController(
  actions: ResolvedAction[],
  plans: MethodActionPlan[],
  options: FrontendDelphiDialogControllerOptions
): string {
  const saveBinding = findBinding(actions, plans, (plan) => plan.hasPersistence);
  const executorName = saveBinding ? `execute${sanitizeMethodName(saveBinding.plan.methodName)}` : undefined;
  const executorImport = executorName ? `import { ${executorName} } from './${options.entity}DelphiActions';\n` : '';
  const submitBody = executorName
    ? `await ${executorName}(runtime, { input, id: value?.id });`
    : `throw new Error('Nenhum evento Delphi de gravação foi associado a este formulário.');`;

  return `import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import type { ${options.entityPascal}, ${options.entityPascal}Input } from '../types/${options.entity}';
import { ${options.entityPascal}TabbedForm } from '../components/${options.entityPascal}TabbedForm';
import { use${options.entityPascal}DelphiRuntime } from './use${options.entityPascal}DelphiRuntime';
${executorImport}
export interface ${options.entityPascal}DelphiDialogControllerProps {
  open: boolean;
  value?: ${options.entityPascal} | null;
  onClose: () => void;
  onNotify?: (message: string) => void;
  onInvoke?: (target: string, expression?: string) => Promise<unknown> | unknown;
  title?: string;
}

export function ${options.entityPascal}DelphiDialogController({
  open,
  value,
  onClose,
  onNotify,
  onInvoke,
  title
}: ${options.entityPascal}DelphiDialogControllerProps) {
  const runtime = use${options.entityPascal}DelphiRuntime({
    id: value?.id,
    onClose,
    onNotify,
    onInvoke
  });

  const handleSubmit = async (input: ${options.entityPascal}Input): Promise<void> => {
    ${submitBody}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title ?? (value ? 'Editar ${options.entityPascal}' : 'Novo ${options.entityPascal}')}</DialogTitle>
      <DialogContent>
        <${options.entityPascal}TabbedForm
          initialValue={value ?? undefined}
          onSubmit={(input) => { void handleSubmit(input); }}
        />
      </DialogContent>
    </Dialog>
  );
}

${saveBinding ? `// Evento DFM de gravação associado: ${escapeComment(saveBinding.action.name)} -> ${escapeComment(saveBinding.action.event?.handlerName ?? '')}` : '// Nenhum evento DFM de gravação associado.'}
`;
}

interface Binding {
  action: ResolvedAction;
  plan: MethodActionPlan;
}

function findBinding(
  actions: ResolvedAction[],
  plans: MethodActionPlan[],
  predicate: (plan: MethodActionPlan) => boolean
): Binding | undefined {
  for (const action of actions) {
    const handlerName = action.event?.handlerName;
    if (!handlerName) continue;
    const plan = plans.find((candidate) => predicate(candidate) && methodMatchesHandler(candidate.methodName, handlerName));
    if (plan) return { action, plan };
  }
  return undefined;
}

function methodMatchesHandler(methodName: string, handlerName: string): boolean {
  const method = normalizeName(methodName);
  const handler = normalizeName(handlerName);
  return method === handler || method.endsWith(handler);
}

function sanitizeMethodName(value: string): string {
  const parts = value.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('') || 'DelphiAction';
}

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function escapeComment(value: string): string {
  return value.replace(/\r?\n/g, ' ').replace(/\*\//g, '* /').trim();
}
