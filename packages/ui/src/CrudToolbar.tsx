import type { GestorAction } from '@gestor/dsl';
import { Button, Stack } from '@mui/material';

export interface CrudToolbarProps {
  actions: GestorAction[];
  onAction?: (action: GestorAction) => void;
}

export function CrudToolbar({ actions, onAction }: CrudToolbarProps) {
  if (actions.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
      {actions.map((action) => (
        <Button key={action.name} variant={action.kind === 'create' ? 'contained' : 'outlined'} onClick={() => onAction?.(action)}>
          {action.label}
        </Button>
      ))}
    </Stack>
  );
}
