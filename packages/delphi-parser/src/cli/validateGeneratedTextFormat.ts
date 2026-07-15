import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface FormattingIssue {
  path: string;
  rule: 'bom' | 'crlf' | 'trailing-whitespace' | 'missing-final-newline' | 'excess-final-newlines' | 'control-character';
  line?: number;
  detail: string;
}

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:text-format arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const dfm = readFileSync(dfmPath, 'utf8');
const pas = readFileSync(pasPath, 'utf8');
const resolved = resolveDelphiForm(dfm, pas, { entity, table });
const files = [...generateBackendFiles(resolved), ...generateFrontendFiles(resolved)];
const issues: FormattingIssue[] = [];

for (const file of files) {
  const content = file.content;
  if (content.startsWith('\uFEFF')) {
    issues.push({ path: file.path, rule: 'bom', detail: 'O arquivo inicia com BOM UTF-8.' });
  }
  if (content.includes('\r')) {
    issues.push({ path: file.path, rule: 'crlf', detail: 'O arquivo contem CR/CRLF; use somente LF.' });
  }

  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (/[\t ]+$/.test(lines[index])) {
      issues.push({ path: file.path, rule: 'trailing-whitespace', line: index + 1, detail: 'A linha termina com espacos ou tabs.' });
    }
    const invalid = [...lines[index]].find((character) => {
      const code = character.charCodeAt(0);
      return code < 32 && character !== '\t';
    });
    if (invalid) {
      issues.push({ path: file.path, rule: 'control-character', line: index + 1, detail: `Caractere de controle U+${invalid.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase()}.` });
    }
  }

  if (!content.endsWith('\n')) {
    issues.push({ path: file.path, rule: 'missing-final-newline', detail: 'O arquivo nao termina com newline.' });
  } else if (content.endsWith('\n\n')) {
    issues.push({ path: file.path, rule: 'excess-final-newlines', detail: 'O arquivo possui mais de um newline ao final.' });
  }
}

const output = {
  ok: issues.length === 0,
  files: files.length,
  issues: issues.length,
  failures: issues
};

if (json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('Validacao de formato textual dos artefatos gerados');
  console.log(`Arquivos: ${output.files}`);
  for (const issue of issues) {
    console.error(`[ERRO] ${issue.path}${issue.line ? `:${issue.line}` : ''} ${issue.rule}: ${issue.detail}`);
  }
  console.log(`Resumo: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`);
}

if (issues.length > 0) process.exit(1);
