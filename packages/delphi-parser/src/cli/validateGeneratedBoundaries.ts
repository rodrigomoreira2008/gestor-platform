import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Violation { layer: 'backend' | 'frontend'; file: string; line: number; rule: string; value: string; }
interface SensitiveRule { name: string; pattern: RegExp; }
interface UnsafeRule { name: string; pattern: RegExp; }

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

const allowedFrontendPackages = new Set([
  'react', 'react-dom', 'react-router-dom', 'zod', 'axios',
  '@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@tanstack/react-query'
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

const backendUnsafeRules: UnsafeRule[] = [
  { name: 'backend-executa-processo', pattern: /\bProcess\s*\.\s*Start\s*\(/ },
  { name: 'backend-executa-shell', pattern: /\b(?:cmd\.exe|powershell(?:\.exe)?|\/bin\/(?:sh|bash))\b/i },
  { name: 'backend-carrega-biblioteca-nativa', pattern: /\b(?:DllImport|NativeLibrary\.Load)\b/ },
  { name: 'backend-desserializacao-insegura', pattern: /\b(?:BinaryFormatter|LosFormatter|NetDataContractSerializer)\b/ },
  { name: 'backend-sql-concatenado', pattern: /\b(?:FromSqlRaw|ExecuteSqlRaw)\s*\(\s*\$?["'`][^"'`]*(?:\+|\{)/ }
];

const frontendUnsafeRules: UnsafeRule[] = [
  { name: 'frontend-eval', pattern: /\beval\s*\(/ },
  { name: 'frontend-function-constructor', pattern: /\bnew\s+Function\s*\(/ },
  { name: 'frontend-html-inseguro', pattern: /\bdangerouslySetInnerHTML\b/ },
  { name: 'frontend-document-write', pattern: /\bdocument\s*\.\s*write(?:ln)?\s*\(/ },
  { name: 'frontend-innerhtml', pattern: /\.\s*(?:innerHTML|outerHTML)\s*=/ },
  { name: 'frontend-javascript-url', pattern: /["']javascript\s*:/i },
  { name: 'frontend-http-absoluto', pattern: /["']http:\/\/(?!localhost(?::\d+)?(?:\/|["']))[^"']+/i }
];

for (const file of backend) {
  const lines = file.content.split('\n');
  lines.forEach((line, index) => {
    const usingMatch = line.match(/^\s*using\s+([^;]+);/);
    if (usingMatch) {
      const namespace = usingMatch[1].trim();
      if (/^(react|@|zod|axios|vite|apps\.frontend|frontend\b)/i.test(namespace)) {
        violations.push({ layer: 'backend', file: file.path, line: index + 1, rule: 'backend-importa-dependencia-frontend', value: namespace });
      }
    }
    if (/apps[\\/]frontend|\.tsx?\b|node_modules/i.test(line)) {
      violations.push({ layer: 'backend', file: file.path, line: index + 1, rule: 'backend-referencia-artefato-frontend', value: line.trim() });
    }
    scanRules('backend', file.path, line, index + 1, backendUnsafeRules);
    scanSensitiveLine('backend', file.path, line, index + 1);
    scanUnicodeLine('backend', file.path, line, index + 1);
  });
}

for (const file of frontend) {
  const lines = file.content.split('\n');
  lines.forEach((line, index) => {
    const sourceMatch = line.match(/(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/);
    if (sourceMatch) {
      const source = sourceMatch[1];
      const normalized = source.startsWith('node:') ? source.slice(5) : source;
      const rootPackage = normalized.split('/')[0];
      if (source.startsWith('node:') || nodeBuiltins.has(rootPackage)) {
        violations.push({ layer: 'frontend', file: file.path, line: index + 1, rule: 'frontend-importa-api-node', value: source });
      }
      if (/apps[\\/]backend|\.cs\b|^Microsoft\.|^System\./i.test(source)) {
        violations.push({ layer: 'frontend', file: file.path, line: index + 1, rule: 'frontend-importa-dependencia-backend', value: source });
      }
      if (!source.startsWith('.') && !source.startsWith('/') && !source.startsWith('node:')) {
        const packageName = getPackageName(source);
        if (!allowedFrontendPackages.has(packageName)) {
          violations.push({ layer: 'frontend', file: file.path, line: index + 1, rule: 'frontend-dependencia-nao-permitida', value: packageName });
        }
      }
    }
    if (/apps[\\/]backend|\.cs\b|using\s+(Microsoft|System)\./i.test(line)) {
      violations.push({ layer: 'frontend', file: file.path, line: index + 1, rule: 'frontend-referencia-artefato-backend', value: line.trim() });
    }
    scanRules('frontend', file.path, line, index + 1, frontendUnsafeRules);
    scanSensitiveLine('frontend', file.path, line, index + 1);
    scanUnicodeLine('frontend', file.path, line, index + 1);
  });
}

const unique = [...new Map(violations.map((item) => [`${item.layer}:${item.file}:${item.line}:${item.rule}:${item.value}`, item])).values()];
const sensitiveCount = unique.filter((item) => item.rule.startsWith('segredo-') || item.rule === 'senha-literal').length;
const unicodeCount = unique.filter((item) => item.rule.startsWith('unicode-')).length;
const dependencyCount = unique.filter((item) => item.rule.includes('dependencia-nao-permitida')).length;
const unsafeCount = unique.filter((item) => (item.rule.startsWith('backend-') || item.rule.startsWith('frontend-')) && !item.rule.includes('dependencia-nao-permitida')).length;
const output = {
  ok: unique.length === 0,
  entity,
  table: table ?? null,
  files: { backend: backend.length, frontend: frontend.length },
  allowedFrontendPackages: [...allowedFrontendPackages].sort(),
  sensitiveRules: sensitiveRules.map((rule) => rule.name),
  unsafeRules: [...backendUnsafeRules, ...frontendUnsafeRules].map((rule) => rule.name),
  unicodeRules: ['unicode-controle-bidirecional', 'unicode-zero-width', 'unicode-nao-caractere'],
  sensitiveCount,
  unsafeCount,
  unicodeCount,
  dependencyCount,
  violations: unique
};

if (json) console.log(JSON.stringify(output, null, 2));
else {
  console.log('Validacao de fronteiras, seguranca e dependencias dos artefatos gerados');
  console.log(`Backend: ${backend.length} arquivo(s); frontend: ${frontend.length} arquivo(s)`);
  for (const violation of unique) {
    console.error(`[ERRO] ${violation.layer} ${violation.file}:${violation.line} ${violation.rule}: ${violation.value}`);
  }
  console.log(dependencyCount === 0 ? 'Dependencias frontend pertencem a lista permitida.' : `${dependencyCount} dependencia(s) externa(s) nao permitida(s).`);
  console.log(sensitiveCount === 0 ? 'Nenhum segredo literal detectado.' : `${sensitiveCount} possivel(is) segredo(s) detectado(s).`);
  console.log(unicodeCount === 0 ? 'Nenhum caractere Unicode perigoso detectado.' : `${unicodeCount} ocorrencia(s) Unicode perigosa(s).`);
  console.log(unsafeCount === 0 ? 'Nenhum padrao de execucao insegura detectado.' : `${unsafeCount} padrao(oes) inseguro(s) detectado(s).`);
  console.log(unique.length === 0 ? 'Fronteiras de camada preservadas.' : `${unique.length} violacao(oes) encontrada(s).`);
}

if (unique.length > 0) process.exit(1);

function getPackageName(source: string): string {
  const parts = source.split('/');
  return source.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function scanRules(layer: 'backend' | 'frontend', file: string, line: string, lineNumber: number, rules: UnsafeRule[]): void {
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(line)) continue;
    violations.push({ layer, file, line: lineNumber, rule: rule.name, value: line.trim() });
  }
}

function scanSensitiveLine(layer: 'backend' | 'frontend', file: string, line: string, lineNumber: number): void {
  for (const rule of sensitiveRules) {
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(line)) continue;
    violations.push({ layer, file, line: lineNumber, rule: rule.name, value: redact(line.trim()) });
  }
}

function scanUnicodeLine(layer: 'backend' | 'frontend', file: string, line: string, lineNumber: number): void {
  const groups: Array<{ name: string; pattern: RegExp }> = [
    { name: 'unicode-controle-bidirecional', pattern: /[\u202A-\u202E\u2066-\u2069]/g },
    { name: 'unicode-zero-width', pattern: /[\u200B-\u200F\u2060\uFEFF]/g },
    { name: 'unicode-nao-caractere', pattern: /[\uFDD0-\uFDEF\uFFFE\uFFFF]/g }
  ];
  for (const group of groups) {
    const matches = line.match(group.pattern);
    if (!matches) continue;
    const points = [...new Set(matches.map((value) => `U+${value.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`))];
    violations.push({ layer, file, line: lineNumber, rule: group.name, value: points.join(', ') });
  }
}

function redact(value: string): string {
  if (value.length <= 24) return '[conteudo sensivel ocultado]';
  return `${value.slice(0, 12)}...[ocultado]...${value.slice(-8)}`;
}
