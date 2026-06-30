import type { GestorForm } from '@gestor/dsl';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { FormRenderer } from './FormRenderer.js';

export interface CrudPageProps {
  form: GestorForm;
  onSave?: () => void;
  onCancel?: () => void;
}

export function CrudPage({ form, onSave, onCancel }: CrudPageProps) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {form.title}
      </Typography>

      <Card>
        <CardContent>
          <FormRenderer form={form} />

          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
            <Button variant="contained" onClick={onSave}>Salvar</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
