import { renderFrontendDelphiActionController } from './frontendDelphiActionControllerGenerator';
import { renderFrontendDelphiDialogController } from './frontendDelphiDialogControllerGenerator';
import { renderFrontendDelphiPage } from './frontendDelphiPageGenerator';
import { renderFrontendDelphiRuntime } from './frontendDelphiRuntimeGenerator';
import { generateFrontendFiles, type FrontendGeneratedFile, type FrontendGeneratorOptions } from './frontendGenerator';
import { renderFrontendMethodActionAdapters } from './frontendMethodActionGenerator';
import type { ResolvedForm } from './resolvedForm';

export function generateFrontendFilesWithDelphiActions(
  resolved: ResolvedForm,
  options: FrontendGeneratorOptions = {}
): FrontendGeneratedFile[] {
  const files = generateFrontendFiles(resolved, options);
  const entity = toCamelCase(resolved.form.entity);
  const entityPascal = toPascalCase(resolved.form.entity);
  const plural = toKebabPlural(entity);
  const outputRoot = options.outputRoot ?? `apps/frontend/src/modules/${plural}`;
  const plans = resolved.methodActionPlans ?? [];

  return [
    ...files,
    {
      path: `${outputRoot}/delphi/${entity}DelphiActions.ts`,
      content: renderFrontendMethodActionAdapters(plans, { entityPascal, entity })
    },
    {
      path: `${outputRoot}/delphi/use${entityPascal}DelphiRuntime.ts`,
      content: renderFrontendDelphiRuntime({ entityPascal, entity })
    },
    {
      path: `${outputRoot}/delphi/use${entityPascal}DelphiActionController.ts`,
      content: renderFrontendDelphiActionController(resolved.actions, plans, { entityPascal, entity })
    },
    {
      path: `${outputRoot}/delphi/${entityPascal}DelphiDialogController.tsx`,
      content: renderFrontendDelphiDialogController(resolved.actions, plans, { entityPascal, entity })
    },
    {
      path: `${outputRoot}/pages/${entityPascal}DelphiPage.tsx`,
      content: renderFrontendDelphiPage(resolved.actions, plans, { entityPascal, entity })
    }
  ];
}

function toPascalCase(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabPlural(value: string): string {
  const kebab = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return kebab.endsWith('s') ? kebab : `${kebab}s`;
}
