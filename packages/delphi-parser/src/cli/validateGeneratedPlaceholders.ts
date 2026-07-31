import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface Finding { path: string; rule: string; line: number; excerpt: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:placeholders arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const files = [...generateBackendFiles(resolved), ...generateFrontendFiles(resolved)];
const rules = [
  { name: 'marcador de merge', pattern: /^(<<<<<<<|=======|>>>>>>>)/m },
  { name: 'valor undefined renderizado', pattern: /\bundefined\b/ },
  { name: 'objeto serializado incorretamente', pattern: /\[object Object\]/ },
  { name: 'placeholder handlebars', pattern: /\{\{[^}]+\}\}/ },
  { name: 'placeholder template residual', pattern: /\$\{[^}]+\}/ },
  { name: 'marcador FIXME', pattern: /\bFIXME\b/i }
];

const findings: Finding[] = [];
for (const file of files) {
  const lines = file.content.split(/\r?\n/);
  for (const rule of rules) {
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index] ?? '';
      if (!rule.pattern.test(line)) continue;
      findings.push({ path: file.path, rule: rule.name, line: index + 1, excerpt: line.trim().slice(0, 180) });
    }
  }
}

const output = { ok: findings.length === 0, files: files.length, findings };
if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log('Validacao de placeholders dos artefatos gerados');
  console.log(`Arquivos analisados: ${files.length}`);
  for (const finding of findings) console.error(`[ERRO] ${finding.path}:${finding.line} ${finding.rule}: ${finding.excerpt}`);
  console.log(findings.length === 0 ? 'Nenhum placeholder residual encontrado.' : `Falhas: ${findings.length}`);
}
if (findings.length > 0) process.exit(1);
