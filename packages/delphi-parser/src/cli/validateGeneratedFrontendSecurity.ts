import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Finding { file: string; rule: string; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-security arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const sourceFiles = generated.filter((file) => /\.(ts|tsx)$/.test(file.path));
const diagnostics: string[] = [];
const findings: Finding[] = [];
let fetchCalls = 0;
let apiFetchCalls = 0;
let signalForwarding = 0;

const forbiddenTextRules: Array<{ rule: string; pattern: RegExp; detail: string }> = [
  { rule: 'dynamic-code', pattern: /\beval\s*\(|\bnew\s+Function\s*\(/, detail: 'execucao dinamica de codigo nao permitida' },
  { rule: 'unsafe-html', pattern: /dangerouslySetInnerHTML|\.innerHTML\s*=/, detail: 'insercao direta de HTML nao permitida' },
  { rule: 'browser-storage', pattern: /\b(?:localStorage|sessionStorage)\b/, detail: 'persistencia direta no storage do navegador nao permitida no codigo gerado' },
  { rule: 'document-cookie', pattern: /document\.cookie/, detail: 'acesso direto a cookies nao permitido' },
  { rule: 'navigation-write', pattern: /(?:window\.)?location\.(?:href|assign|replace)\s*(?:=|\()/, detail: 'redirecionamento imperativo nao permitido' },
  { rule: 'hardcoded-secret', pattern: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/i, detail: 'possivel segredo embutido no codigo' },
  { rule: 'external-url', pattern: /https?:\/\//i, detail: 'URL absoluta externa nao permitida no modulo gerado' }
];

for (const file of sourceFiles) {
  for (const rule of forbiddenTextRules) {
    if (rule.pattern.test(file.content)) findings.push({ file: file.path, rule: rule.rule, detail: rule.detail });
  }

  const source = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.ES2022, true, file.path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const diagnostic of source.parseDiagnostics) {
    diagnostics.push(`${file.path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
  }

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'fetch') {
      fetchCalls += 1;
      const [url, options] = node.arguments;
      const urlText = url?.getText(source) ?? '';
      if (/['"`]\/api\//.test(urlText) || urlText.includes('/api/')) apiFetchCalls += 1;
      else findings.push({ file: file.path, rule: 'fetch-origin', detail: `fetch fora de /api/: ${urlText || 'URL ausente'}` });

      if (options && ts.isObjectLiteralExpression(options)) {
        const signal = options.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText(source) === 'signal');
        if (signal) signalForwarding += 1;
        const credentials = options.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText(source) === 'credentials');
        if (credentials && ts.isPropertyAssignment(credentials)) {
          const value = credentials.initializer.getText(source).replace(/['"]/g, '');
          if (value === 'include') findings.push({ file: file.path, rule: 'credentials-include', detail: 'credentials: include exige revisao explicita' });
        }
      }
    }

    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const owner = node.expression.expression.getText(source);
      const method = node.expression.name.text;
      if (owner === 'console' && method !== 'error' && method !== 'warn') {
        findings.push({ file: file.path, rule: 'console-output', detail: `console.${method} nao deve permanecer no artefato gerado` });
      }
    }

    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (fetchCalls > 0 && apiFetchCalls !== fetchCalls) diagnostics.push(`apenas ${apiFetchCalls}/${fetchCalls} chamadas fetch usam endpoints /api/`);
if (fetchCalls > 0 && signalForwarding !== fetchCalls) diagnostics.push(`apenas ${signalForwarding}/${fetchCalls} chamadas fetch encaminham AbortSignal`);
for (const finding of findings) diagnostics.push(`${finding.file}: [${finding.rule}] ${finding.detail}`);

const ok = diagnostics.length === 0;
const runtimeMarker = ok ? `FRONTEND_SECURITY_OK:${entity}:files=${sourceFiles.length}:fetch=${fetchCalls}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  inspectedFiles: sourceFiles.length,
  fetchCalls,
  apiFetchCalls,
  signalForwarding,
  findings,
  runtimeMarker,
  diagnostics
};

if (json) console.log(JSON.stringify(report, null, 2));
else if (ok) console.log(runtimeMarker);
else for (const diagnostic of diagnostics) console.error(diagnostic);

if (!ok) process.exit(1);
