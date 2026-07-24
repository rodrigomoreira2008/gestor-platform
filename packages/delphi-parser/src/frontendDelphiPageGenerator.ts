import type { MethodActionPlan } from './methodActionPlanning';
import type { ResolvedAction } from './resolvedForm';

export interface FrontendDelphiPageGeneratorOptions {
  entityPascal: string;
  entity: string;
}

export function renderFrontendDelphiPage(
  actions: ResolvedAction[],
  plans: MethodActionPlan[],
  options: FrontendDelphiPageGeneratorOptions
): string {
  const deleteBinding = findBinding(actions, plans, (plan) => plan.hasDestructiveAction);
  const deleteExecutor = deleteBinding ? `execute${sanitizeMethodName(deleteBinding.plan.methodName)}` : undefined;
  const deleteImport = deleteExecutor ? `import { ${deleteExecutor} } from '../delphi/${options.entity}DelphiActions';\n` : '';
  const deleteExecution = deleteExecutor
    ? `await ${deleteExecutor}(runtime, { input: removing as ${options.entityPascal}Input, id: removing.id });`
    : `throw new Error('Nenhum evento Delphi de exclusão foi associado a esta página.');`;

  return `import { Add, Delete, Edit } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { ${options.entityPascal}DelphiDialogController } from '../delphi/${options.entityPascal}DelphiDialogController';
import { use${options.entityPascal}DelphiRuntime } from '../delphi/use${options.entityPascal}DelphiRuntime';
${deleteImport}import { use${options.entityPascal}s } from '../hooks';
import { ${options.entity}Columns } from '../table/${options.entity}Columns';
import type { ${options.entityPascal}, ${options.entityPascal}Input } from '../types/${options.entity}';

export function ${options.entityPascal}DelphiPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<${options.entityPascal} | null>(null);
  const [removing, setRemoving] = useState<${options.entityPascal} | null>(null);
  const list = use${options.entityPascal}s();
  const runtime = use${options.entityPascal}DelphiRuntime({
    id: removing?.id,
    onClose: () => setRemoving(null)
  });

  const columns = useMemo<GridColDef<${options.entityPascal}>[]>(() => [
    ...${options.entity}Columns,
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" aria-label="Editar" onClick={() => setEditing(row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Excluir" color="error" onClick={() => setRemoving(row)}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ], []);

  const closeEditor = () => {
    setIsCreating(false);
    setEditing(null);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!removing) return;
    ${deleteExecution}
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">${options.entityPascal}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setIsCreating(true)}>Novo</Button>
      </Box>

      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={list.data ?? []}
          columns={columns}
          loading={list.isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>

      <${options.entityPascal}DelphiDialogController
        open={isCreating || Boolean(editing)}
        value={editing}
        onClose={closeEditor}
      />

      <Dialog open={Boolean(removing)} onClose={() => setRemoving(null)} fullWidth maxWidth="xs">
        <DialogTitle>Excluir ${options.entityPascal}</DialogTitle>
        <DialogContent>
          <Typography>Confirma a exclusão deste registro?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoving(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => { void confirmDelete(); }}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

${deleteBinding ? `// Evento DFM de exclusão associado: ${escapeComment(deleteBinding.action.name)} -> ${escapeComment(deleteBinding.action.event?.handlerName ?? '')}` : '// Nenhum evento DFM de exclusão associado.'}
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
