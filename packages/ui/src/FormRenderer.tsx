import type { GestorField, GestorForm } from '@gestor/dsl';
import { Box, TextField, Typography } from '@mui/material';

export interface FormRendererProps {
  form: GestorForm;
}

export function FormRenderer({ form }: FormRendererProps) {
  const sections = groupFieldsBySection(form.fields);

  return (
    <Box component="form" sx={{ display: 'grid', gap: 2 }}>
      {sections.map((section) => (
        <Box key={section.name} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
          {section.name !== 'Geral' && (
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {section.name}
            </Typography>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {section.fields.map((field) => (
              <FieldRenderer key={field.name} field={field} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function FieldRenderer({ field }: { field: GestorField }) {
  if (field.type === 'grid') {
    return (
      <Box sx={{ gridColumn: '1 / -1', border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <Typography variant="subtitle2">{field.label}</Typography>
      </Box>
    );
  }

  if (field.type === 'memo') {
    return <TextField label={field.label} name={field.name} multiline minRows={4} fullWidth required={field.required} disabled={field.readOnly} sx={{ gridColumn: '1 / -1' }} />;
  }

  const type = field.type === 'date' ? 'date' : field.type === 'datetime' ? 'datetime-local' : 'text';
  const shrink = field.type === 'date' || field.type === 'datetime';

  return <TextField label={field.label} name={field.name} type={type} fullWidth required={field.required} disabled={field.readOnly} InputLabelProps={shrink ? { shrink: true } : undefined} />;
}

function groupFieldsBySection(fields: GestorField[]): Array<{ name: string; fields: GestorField[] }> {
  const map = new Map<string, GestorField[]>();

  for (const field of fields) {
    const section = field.section ?? 'Geral';
    map.set(section, [...(map.get(section) ?? []), field]);
  }

  return Array.from(map.entries()).map(([name, sectionFields]) => ({ name, fields: sectionFields }));
}
