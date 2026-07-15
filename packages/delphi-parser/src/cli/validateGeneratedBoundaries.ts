import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Violation { layer: 'backend' | 'frontend'; file: string; line: number; rule: string; value: string; }
interface SensitiveRule { name: string; pattern: RegExp; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:boundaries arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const backend = generateBackendFiles(resolved) as GeneratedFile[];
const frontend = generateFrontendFiles(resolved) as GeneratedFile[];
const violations: Violation[] = [];

const nodeBuiltins = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https',
  'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'readline', 'stream', 'string_decoder', 'timers',
  'tls', 'tty', 'url', 'util', 'v8', 'vm', 'worker_threads', 'zlib'
]);

const sensitiveRules: SensitiveRule[] = [
  { name: 'segredo-chave-privada', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i },
  { name: 'segredo-token-bearer', pattern: /Bearer\s+[A-Za-z0-9._~+/=-]{20,}/i },
  { name: 'segredo-aws-access-key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { name: 'segredo-github-token', pattern: /\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{30,}\b/ },
  { name: 'segredo-jwt', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { name: 'segredo-url-com-credenciais', pattern: /\bhttps?:\/\/[^\s:@/]+:[^\s@/]+@/i },
  { name: 'segredo-connection-string', pattern: /(?:Password|Pwd)\s*=\s*[^;\s"']{3,}/i },
  { name: 'segredo-literal', pattern: /\b(?:api[_-]?key|secret|client[_-]?secret|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*["'][^"']{12,}["']/i },
  { name: 'senha-literal', pattern: /\b(?:password|passwd|pwd)\b\s*[:=]\s*["'][^"']{8,}["']/i }
];

const unicodeRules: SensitiveRule[] = [
  { name: 'unicode-controle-bidirecional', pattern: /[\u202A-\u202E\u2066-\u2069]/u },
  { name: 'unicode-zero-width', pattern: /[\u200B-\u200F\u2060\uFEFF]/u },
  { name: 'unicode-separador-invisivel', pattern: /[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/u },
  { name: 'unicode-nao-caractere', pattern: /[\uFDD0-\uFDEF\uFFFE\uFFFF]/u }
];

for (const file of backend) scanFile('backend', file);
for (const file of frontend) scanFile('frontend', file);

const unique = [...new Map(violations.map((item) => [`${item.layer}:${item.file}:${item.line}:${item.rule}:${item.value}`, item])).values()];
const sensitiveCount = unique.filter((item) => item.rule.startsWith('segredo-') || item.rule === 'senha-literal').length;
const unicodeCount = unique.filter((item) => item.rule.startsWith('unicode-')).length;
const output = {
  ok: unique.length === 0,
  entity,
  table: table ?? null,
  files: { backend: backend.length, frontend: frontend.length },
  sensitiveRules: sensitiveRules.map((rule) => rule.name),
  unicodeRules: unicodeRules.map((rule) => rule.name),
  sensitiveCount,
  unicodeCount,
  violations: unique
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log('Validacao de fronteiras, dados sensiveis e Unicode dos artefatos gerados');
  console.log(`Backend: ${backend.length} arquivo(s); frontend: ${frontend.length} arquivo(s)`);
  for (const violation of unique) {
    console.error(`[ERRO] ${violation.layer} ${violation.file}:${violation.line} ${violation.rule}: ${violation.value}`);
  }
  console.log(sensitiveCount === 0 ? 'Nenhum segredo literal detectado.' : `${sensitiveCount} possivel(is) segredo(s) detectado(s).`);
  console.log(unicodeCount === 0 ? 'Nenhum caractere Unicode perigoso detectado.' : `${unicodeCount} ocorrencia(s) Unicode perigosa(s) detectada(s).`);
  console.log(unique.length === 0 ? 'Fronteiras de camada preservadas.' : `${unique.length} violacao(oes) encontrada(s).`);
}

if (unique.length > 0) process.exit(1);

function scanFile(layer: 'backend' | 'frontend', file: GeneratedFile): void {
  const lines = file.content.split('\n');
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (layer === 'backend') scanBackendLine(file.path, line, lineNumber);
    else scanFrontendLine(file.path, line, lineNumber);
    scanRules(layer, file.path, line, lineNumber, sensitiveRules, true);
    scanRules(layer, file.path, line, lineNumber, unicodeRules, false);
  });
}

function scanBackendLine(file: string, line: string, lineNumber: number): void {
  const usingMatch = line.match(/^\s*using\s+([^;]+);/);
  if (usingMatch) {
    const namespace = usingMatch[1].trim();
    if (/^(react|@|zod|axios|vite|apps\.frontend|frontend\b)/i.test(namespace)) {
      violations.push({ layer: 'backend', file, line: lineNumber, rule: 'backend-importa-dependencia-frontend', value: namespace });
    }
  }
  if (/apps[\\/]frontend|\.tsx?\b|node_modules/i.test(line)) {
    violations.push({ layer: 'backend', file, line: lineNumber, rule: 'backend-referencia-artefato-frontend', value: line.trim() });
  }
}

function scanFrontendLine(file: string, line: string, lineNumber: number): void {
  const sourceMatch = line.match(/(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/);
  if (sourceMatch) {
    const source = sourceMatch[1];
    const normalized = source.startsWith('node:') ? source.slice(5) : source;
    const rootPackage = normalized.split('/')[0];
    if (source.startsWith('node:') || nodeBuiltins.has(rootPackage)) {
      violations.push({ layer: 'frontend', file, line: lineNumber, rule: 'frontend-importa-api-node', value: source });
    }
    if (/apps[\\/]backend|\.cs\b|^Microsoft\.|^System\./i.test(source)) {
      violations.push({ layer: 'frontend', file, line: lineNumber, rule: 'frontend-importa-dependencia-backend', value: source });
    }
  }
  if (/apps[\\/]backend|\.cs\b|using\s+(Microsoft|System)\./i.test(line)) {
    violations.push({ layer: 'frontend', file, line: lineNumber, rule: 'frontend-referencia-artefato-backend', value: line.trim() });
  }
}

function scanRules(layer: 'backend' | 'frontend', file: string, line: string, lineNumber: number, rules: SensitiveRule[], redactValue: boolean): void {
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(line)) continue;
    violations.push({
      layer,
      file,
      line: lineNumber,
      rule: rule.name,
      value: redactValue ? redact(line.trim()) : describeUnicode(line)
    });
  }
}

function describeUnicode(value: string): string {
  const matches = [...value].filter((character) => unicodeRules.some((rule) => {
    rule.pattern.lastIndex = 0;
    return rule.pattern.test(character);
  }));
  const codes = matches.map((character) => `U+${character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`);
  return [...new Set(codes)].join(', ');
}

function redact(value: string): string {
  if (value.length <= 24) return '[conteudo sensivel ocultado]';
  return `${value.slice(0, 12)}...[ocultado]...${value.slice(-8)}`;
}
