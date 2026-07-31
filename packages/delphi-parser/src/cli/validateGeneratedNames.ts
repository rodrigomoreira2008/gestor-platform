import { basename } from 'node:path';
import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface NamingIssue { scope: 'backend' | 'frontend'; file: string; rule: string; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:names arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const backend = generateBackendFiles(resolved) as GeneratedFile[];
const frontend = generateFrontendFiles(resolved) as GeneratedFile[];
const issues: NamingIssue[] = [];

const pascal = /^[A-Z][A-Za-z0-9]*$/;
const camel = /^[a-z][A-Za-z0-9]*$/;
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

for (const file of backend) {
  const name = basename(file.path, '.cs');
  if (file.path.endsWith('.cs') && !pascal.test(name)) {
    issues.push({ scope: 'backend', file: file.path, rule: 'arquivo C# em PascalCase', detail: name });
  }
  for (const match of file.content.matchAll(/\b(?:class|record|interface)\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
    if (!pascal.test(match[1])) issues.push({ scope: 'backend', file: file.path, rule: 'tipo C# em PascalCase', detail: match[1] });
  }
  for (const match of file.content.matchAll(/\bpublic\s+(?:required\s+)?[A-Za-z0-9_?.<>\[\], ]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g)) {
    if (!pascal.test(match[1])) issues.push({ scope: 'backend', file: file.path, rule: 'membro publico C# em PascalCase', detail: match[1] });
  }
}

for (const file of frontend) {
  const extension = file.path.endsWith('.tsx') ? '.tsx' : '.ts';
  const name = basename(file.path, extension);
  const isComponent = extension === '.tsx';
  if (isComponent && !pascal.test(name)) {
    issues.push({ scope: 'frontend', file: file.path, rule: 'componente TSX em PascalCase', detail: name });
  }
  if (!isComponent && !camel.test(name) && name !== 'index') {
    issues.push({ scope: 'frontend', file: file.path, rule: 'modulo TypeScript em camelCase', detail: name });
  }
  for (const match of file.content.matchAll(/\b(?:interface|type|class|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
    if (!pascal.test(match[1])) issues.push({ scope: 'frontend', file: file.path, rule: 'tipo TypeScript em PascalCase', detail: match[1] });
  }
  for (const match of file.content.matchAll(/\b(?:const|let|function)\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
    const symbol = match[1];
    const valid = isComponent && symbol === name ? pascal.test(symbol) : camel.test(symbol);
    if (!valid) issues.push({ scope: 'frontend', file: file.path, rule: 'simbolo TypeScript em camelCase ou componente em PascalCase', detail: symbol });
  }
}

const routeLike = [...backend, ...frontend].flatMap((file) => [...file.content.matchAll(/['"]\/?([a-z0-9][a-z0-9\-/]*)['"]/g)].map((match) => ({ file: file.path, value: match[1] })));
for (const candidate of routeLike) {
  const segments = candidate.value.split('/').filter(Boolean);
  if (segments.length > 1 && segments.some((segment) => segment.includes('-') && !kebab.test(segment))) {
    issues.push({ scope: candidate.file.includes('frontend') ? 'frontend' : 'backend', file: candidate.file, rule: 'segmento de rota em kebab-case', detail: candidate.value });
  }
}

const output = { ok: issues.length === 0, entity, table: table ?? null, backendFiles: backend.length, frontendFiles: frontend.length, issues };
if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log('Validacao de nomes dos artefatos gerados');
  console.log(`Backend: ${backend.length} arquivo(s); frontend: ${frontend.length} arquivo(s)`);
  for (const issue of issues) console.error(`[ERRO] ${issue.file}: ${issue.rule} (${issue.detail})`);
  console.log(issues.length === 0 ? 'Resumo: nomes consistentes.' : `Resumo: ${issues.length} problema(s).`);
}
if (issues.length > 0) process.exit(1);
