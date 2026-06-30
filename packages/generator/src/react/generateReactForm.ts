import type { GestorField, GestorForm } from '@gestor/dsl';

export interface ReactGenerationOptions {
  componentName?: string;
}

export function generateReactForm(form: GestorForm, options: ReactGenerationOptions = {}): string {
  const componentName = options.componentName ?? toPascalCase(form.entity);
  const fields = form.fields.map(renderField).join('\n');

  return `import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';

export function ${componentName}Page() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        ${escapeText(form.title)}
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
${indent(fields, 12)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined">Cancelar</Button>
            <Button variant="contained">Salvar</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
`;
}

function renderField(field: GestorField): string {
  if (field.type === 'grid') {
    return `<Box sx={{ gridColumn: '1 / -1', border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2 }}>
  <Typography variant="subtitle2">${escapeText(field.label)}</Typography>
</Box>`;
  }

  if (field.type === 'memo') {
    return `<TextField label="${escapeText(field.label)}" name="${field.name}" multiline minRows={4} fullWidth />`;
  }

  const inputType = field.type === 'date' ? 'date' : field.type === 'datetime' ? 'datetime-local' : 'text';
  const inputLabelProps = field.type === 'date' || field.type === 'datetime' ? ' InputLabelProps={{ shrink: true }}' : '';

  return `<TextField label="${escapeText(field.label)}" name="${field.name}" type="${inputType}" fullWidth${inputLabelProps} />`;
}

function toPascalCase(value: string): string {
  return value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function indent(value: string, spaces: number): string {
  const prefix = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : line))
    .join('\n');
}

function escapeText(value: string): string {
  return value.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
