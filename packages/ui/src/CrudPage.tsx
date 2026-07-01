import type { GestorAction, GestorField, GestorForm } from '@gestor/dsl';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { CrudToolbar } from './CrudToolbar.js';
import { FormRenderer, type FormValues } from './FormRenderer.js';

export interface CrudPageProps {
  form: GestorForm;
  values?: FormValues;
  onValueChange?: (field: GestorField, value: unknown) => void;
  onAction?: (action: GestorAction) => void;
}

export function CrudPage({ form, values, onValueChange, onAction }: CrudPageProps) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {form.title}
      </Typography>

      <Card>
        <CardContent>
          <CrudToolbar actions={form.actions} onAction={onAction} />
          <FormRenderer form={form} values={values} onChange={onValueChange} />
        </CardContent>
      </Card>
    </Box>
  );
}
