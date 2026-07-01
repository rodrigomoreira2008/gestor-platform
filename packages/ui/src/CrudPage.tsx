import type { GestorAction, GestorForm } from '@gestor/dsl';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { CrudToolbar } from './CrudToolbar.js';
import { FormRenderer } from './FormRenderer.js';

export interface CrudPageProps {
  form: GestorForm;
  onAction?: (action: GestorAction) => void;
}

export function CrudPage({ form, onAction }: CrudPageProps) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {form.title}
      </Typography>

      <Card>
        <CardContent>
          <CrudToolbar actions={form.actions} onAction={onAction} />
          <FormRenderer form={form} />
        </CardContent>
      </Card>
    </Box>
  );
}
