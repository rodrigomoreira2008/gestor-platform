import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface AccessibilityFinding { file: string; rule: string; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-accessibility arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const entityPascal = entity.charAt(0).toUpperCase() + entity.slice(1);
const diagnostics: string[] = [];
const findings: AccessibilityFinding[] = [];
let interactiveElements = 0;
let labelledElements = 0;
let formControls = 0;
let dialogs = 0;
let dataGrids = 0;

const relevantFiles = generated.filter((file) => file.path.endsWith('.tsx'));

for (const file of relevantFiles) {
  const sourceFile = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const diagnostic of sourceFile.parseDiagnostics) {
    diagnostics.push(`${file.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
  }

  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sourceFile);
      const attributes = new Map<string, ts.JsxAttributeLike>();
      for (const property of node.attributes.properties) {
        if (ts.isJsxAttribute(property)) attributes.set(property.name.text, property);
      }

      if (['Button', 'IconButton'].includes(tag)) {
        interactiveElements += 1;
        const hasVisibleText = ts.isJsxOpeningElement(node) && node.parent.children.some((child) => ts.isJsxText(child) && child.text.trim().length > 0);
        const hasAriaLabel = attributes.has('aria-label');
        if (hasVisibleText || hasAriaLabel) labelledElements += 1;
        else findings.push({ file: file.path, rule: 'interactive-name', detail: `${tag} sem texto visivel ou aria-label` });
      }

      if (['TextField', 'Checkbox', 'Select', 'Autocomplete'].includes(tag)) {
        formControls += 1;
        const labelled = attributes.has('label') || attributes.has('aria-label') || attributes.has('aria-labelledby');
        if (labelled || tag === 'Autocomplete') labelledElements += 1;
        else findings.push({ file: file.path, rule: 'control-label', detail: `${tag} sem label acessivel` });
      }

      if (tag === 'Dialog') {
        dialogs += 1;
        if (!attributes.has('open')) findings.push({ file: file.path, rule: 'dialog-state', detail: 'Dialog sem propriedade open' });
      }

      if (tag === 'DataGrid') {
        dataGrids += 1;
        if (!attributes.has('rows')) findings.push({ file: file.path, rule: 'grid-rows', detail: 'DataGrid sem rows' });
        if (!attributes.has('columns')) findings.push({ file: file.path, rule: 'grid-columns', detail: 'DataGrid sem columns' });
      }

      if (tag === 'IconButton' && !attributes.has('aria-label')) {
        findings.push({ file: file.path, rule: 'icon-button-label', detail: 'IconButton sem aria-label' });
      }

      if (attributes.has('onClick') && tag === 'Box' && !attributes.has('role')) {
        findings.push({ file: file.path, rule: 'clickable-noninteractive', detail: 'Box clicavel sem role' });
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entityPascal}Page.tsx`));
if (!pageFile) diagnostics.push(`pagina ${entityPascal}Page.tsx nao foi gerada`);
else {
  for (const expected of ['aria-label="Editar"', 'aria-label="Excluir"', 'placeholder="Pesquisar em todos os campos..."']) {
    if (!pageFile.content.includes(expected)) diagnostics.push(`pagina nao contem contrato acessivel esperado: ${expected}`);
  }
}

const tabbedForm = generated.find((file) => file.path.endsWith(`/components/${entityPascal}TabbedForm.tsx`));
if (!tabbedForm) diagnostics.push(`formulario ${entityPascal}TabbedForm.tsx nao foi gerado`);
else {
  if (!tabbedForm.content.includes('component="form"')) diagnostics.push('formulario com abas nao usa elemento semantico form');
  if (!tabbedForm.content.includes('type="submit"')) diagnostics.push('formulario com abas nao possui botao submit');
}

for (const finding of findings) diagnostics.push(`${finding.file}: [${finding.rule}] ${finding.detail}`);

const ok = diagnostics.length === 0;
const runtimeMarker = ok
  ? `FRONTEND_ACCESSIBILITY_OK:${entityPascal}:interactive=${interactiveElements}:controls=${formControls}:dialogs=${dialogs}:grids=${dataGrids}`
  : null;

const report = {
  ok,
  entity: entityPascal,
  generatedFiles: generated.length,
  inspectedFiles: relevantFiles.length,
  interactiveElements,
  labelledElements,
  formControls,
  dialogs,
  dataGrids,
  findings,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of diagnostics) console.error(diagnostic);
}

if (!ok) process.exit(1);
