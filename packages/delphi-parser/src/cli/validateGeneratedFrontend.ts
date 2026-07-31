import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

const [dfmPath, pasPath, entity, table] = process.argv.slice(2);

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend arquivo.dfm arquivo.pas entidade [tabela]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const files = generateFrontendFiles(resolved);
const requiredFragments = ['types/', 'api/', 'hooks/', 'schema/', 'filters/', 'lookups/', 'components/', 'table/', 'pages/'];
const missingFragments = requiredFragments.filter((fragment) => !files.some((file) => file.path.includes(fragment)));
const emptyFiles = files.filter((file) => file.content.trim().length === 0);
const duplicatePaths = files.map((file) => file.path).filter((path, index, paths) => paths.indexOf(path) !== index);
const missingFields = resolved.fields.length === 0;
const schemaFile = files.find((file) => file.path.includes('/schema/') && file.path.endsWith('Schema.ts'));
const tabbedFormFile = files.find((file) => file.path.endsWith('TabbedForm.tsx'));
const lookupFieldFile = files.find((file) => file.path.endsWith('LookupField.tsx'));
const schemaChecks = {
  exists: Boolean(schemaFile),
  exportsSchema: Boolean(schemaFile?.content.includes('Schema = z.object({')),
  exportsFormData: Boolean(schemaFile?.content.includes('FormData = z.infer<typeof')),
  preprocessesEmptyValues: Boolean(schemaFile?.content.includes('emptyStringToUndefined')),
  excludesIdentityField: !Boolean(schemaFile?.content.match(/^\s+id:\s+/m))
};
const formChecks = {
  exists: Boolean(tabbedFormFile),
  importsSchema: Boolean(tabbedFormFile?.content.includes('../schema/')),
  validatesWithSafeParse: Boolean(tabbedFormFile?.content.includes('.safeParse(form)')),
  mapsFieldErrors: Boolean(tabbedFormFile?.content.includes('result.error.issues')),
  navigatesToInvalidTab: Boolean(tabbedFormFile?.content.includes('setTab(invalidTab)')),
  displaysSubmitError: Boolean(tabbedFormFile?.content.includes('campo(s) destacado(s) antes de salvar.')),
  countsErrorsByTab: Boolean(tabbedFormFile?.content.includes('tabErrorCounts')),
  displaysErrorBadges: Boolean(tabbedFormFile?.content.includes('<Badge color="error"')),
  focusesFirstInvalidField: Boolean(tabbedFormFile?.content.includes('pendingFocusField') && tabbedFormFile?.content.includes('scrollIntoView')),
  exposesInvalidState: Boolean(tabbedFormFile?.content.includes("'aria-invalid': Boolean(errors.")),
  marksBusySubmit: Boolean(tabbedFormFile?.content.includes('aria-busy={isSubmitting}')),
  tracksDirtyState: Boolean(tabbedFormFile?.content.includes('const isDirty = useMemo') && tabbedFormFile?.content.includes('onDirtyChange?.(isDirty)')),
  protectsBrowserExit: Boolean(tabbedFormFile?.content.includes("window.addEventListener('beforeunload'")),
  offersRestoreAction: Boolean(tabbedFormFile?.content.includes('onClick={resetForm}>Restaurar</Button>')),
  communicatesPendingChanges: Boolean(tabbedFormFile?.content.includes('Existem alterações não salvas.')),
  resetsBaselineAfterSubmit: Boolean(tabbedFormFile?.content.includes('baselineRef.current = serializeForm(normalized)')),
  excludesIdentityInput: !Boolean(tabbedFormFile?.content.match(/\bid\s*:\s*initialValue\?\.id/))
};
const lookupChecks = {
  exists: Boolean(lookupFieldFile),
  acceptsError: Boolean(lookupFieldFile?.content.includes('error?: boolean')),
  forwardsErrorToTextField: Boolean(lookupFieldFile?.content.includes('error={error}'))
};
const failedSchemaChecks = Object.entries(schemaChecks).filter(([, ok]) => !ok).map(([name]) => name);
const failedFormChecks = Object.entries(formChecks).filter(([, ok]) => !ok).map(([name]) => name);
const failedLookupChecks = Object.entries(lookupChecks).filter(([, ok]) => !ok).map(([name]) => name);

if (missingFragments.length > 0 || emptyFiles.length > 0 || duplicatePaths.length > 0 || missingFields || failedSchemaChecks.length > 0 || failedFormChecks.length > 0 || failedLookupChecks.length > 0) {
  console.error(JSON.stringify({
    missingFragments,
    emptyFiles: emptyFiles.map((file) => file.path),
    duplicatePaths,
    missingFields,
    failedSchemaChecks,
    failedFormChecks,
    failedLookupChecks
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  entity,
  generatedFiles: files.length,
  fields: resolved.fields.length,
  detailGrids: resolved.detailGrids.length,
  lookups: resolved.lookups.length,
  tabs: resolved.tabs.length,
  schemaChecks,
  formChecks,
  lookupChecks
}, null, 2));
