import type { GestorForm } from '@gestor/dsl';

export interface ReactGenerationOptions {
  componentName?: string;
}

export function generateReactForm(form: GestorForm, options: ReactGenerationOptions = {}): string {
  const componentName = options.componentName ?? toPascalCase(form.entity);
  const serializedForm = JSON.stringify(form, null, 2);

  return `import { CrudPage } from '@gestor/ui';
import type { GestorForm } from '@gestor/dsl';

const form: GestorForm = ${serializedForm};

export function ${componentName}Page() {
  return <CrudPage form={form} />;
}
`;
}

function toPascalCase(value: string): string {
  const result = value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return result || 'GeneratedForm';
}
