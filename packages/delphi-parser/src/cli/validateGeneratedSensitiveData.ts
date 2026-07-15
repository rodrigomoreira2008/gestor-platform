import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile {
  path: string;
  content: string;
}

interface Finding {
  layer: 'backend' | 'frontend';
  path: string;
  line: number;
  rule: string;
  excerpt: string;
}

interface SensitiveRule {
  name: string;
  pattern: RegExp;
}

const rules: SensitiveRule[] = [
  { name: 'chave privada', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i },
  { name: 'token bearer literal', pattern: /Bearer\s+[A-Za-z0-9._~+/=-]{20,}/i },
  { name: 'AWS access key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { name: 'GitHub token', pattern: /\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{30,}\b/ },
  { name: 'JWT literal', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { name: 'URL com credenciais', pattern: /\bhttps?:\/\/[^\s:@/]+:[^\s@/]+@/i },
  { name: 'senha em connection string', pattern: /(?:Password|Pwd)\s*=\s*[^;\s"']{3,}/i },
  { name: 'segredo atribuido em literal', pattern: /\b(?:api[_-]?key|secret|client[_-]?secret|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*["'][^"']{12,}["']/i },
  { name: 'senha atribuida em literal', pattern: /\b(?:password|passwd|pwd)\b\s*[:=]\s*["'][^"']{8,}["']/i }
];

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:sensitive-data arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const layers: Array<{ layer: 'backend' | 'frontend'; files: GeneratedFile[] }> = [
  { layer: 'backend', files: generateBackendFiles(resolved) },
  { layer: 'frontend', files: generateFrontendFiles(resolved) }
];
const findings: Finding[] = [];

for (const { layer, files } of layers) {
  for (const file of files) {
    const lines = file.content.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      for (const rule of rules) {
        rule.pattern.lastIndex = 0;
        if (!rule.pattern.test(line)) continue;
        findings.push({ layer, path: file.path, line: index + 1, rule: rule.name, excerpt: redact(line.trim()) });
      }
    }
  }
}

const output = {
  ok: findings.length === 0,
  entity,
  table: table ?? null,
  files: layers.reduce((total, item) => total + item.files.length, 0),
  rules: rules.map((rule) => rule.name),
  findings
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log('Validacao de dados sensiveis dos artefatos gerados');
  console.log(`Arquivos analisados: ${output.files}`);
  if (findings.length === 0) console.log('[OK] Nenhum segredo ou credencial literal detectado.');
  for (const finding of findings) {
    console.error(`[ERRO] ${finding.layer} ${finding.path}:${finding.line} - ${finding.rule}: ${finding.excerpt}`);
  }
}

if (findings.length > 0) process.exit(1);

function redact(value: string): string {
  if (value.length <= 24) return '[conteudo sensivel ocultado]';
  return `${value.slice(0, 12)}...[ocultado]...${value.slice(-8)}`;
}
