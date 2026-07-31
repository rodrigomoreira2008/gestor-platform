import { readFileSync } from 'node:fs';
import { generateBackendFiles, generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile {
  path: string;
  content: string;
}

interface BudgetFailure {
  scope: 'backend' | 'frontend' | 'combined';
  rule: string;
  actual: number;
  limit: number;
  path?: string;
}

const MAX_FILES_PER_SCOPE = 100;
const MAX_BYTES_PER_FILE = 256 * 1024;
const MAX_LINES_PER_FILE = 5000;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_LINES = 30000;

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const [dfmPath, pasPath, entity, table] = args;
const json = process.argv.includes('--json');

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:budgets arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const backend = generateBackendFiles(resolved) as GeneratedFile[];
const frontend = generateFrontendFiles(resolved) as GeneratedFile[];
const failures: BudgetFailure[] = [];

function inspectScope(scope: 'backend' | 'frontend', files: GeneratedFile[]): { bytes: number; lines: number } {
  if (files.length > MAX_FILES_PER_SCOPE) {
    failures.push({ scope, rule: 'quantidade de arquivos', actual: files.length, limit: MAX_FILES_PER_SCOPE });
  }

  let bytes = 0;
  let lines = 0;
  for (const file of files) {
    const fileBytes = Buffer.byteLength(file.content, 'utf8');
    const fileLines = file.content.length === 0 ? 0 : file.content.split(/\r?\n/).length;
    bytes += fileBytes;
    lines += fileLines;

    if (fileBytes > MAX_BYTES_PER_FILE) {
      failures.push({ scope, rule: 'bytes por arquivo', actual: fileBytes, limit: MAX_BYTES_PER_FILE, path: file.path });
    }
    if (fileLines > MAX_LINES_PER_FILE) {
      failures.push({ scope, rule: 'linhas por arquivo', actual: fileLines, limit: MAX_LINES_PER_FILE, path: file.path });
    }
  }

  return { bytes, lines };
}

const backendTotals = inspectScope('backend', backend);
const frontendTotals = inspectScope('frontend', frontend);
const totalBytes = backendTotals.bytes + frontendTotals.bytes;
const totalLines = backendTotals.lines + frontendTotals.lines;

if (totalBytes > MAX_TOTAL_BYTES) {
  failures.push({ scope: 'combined', rule: 'bytes totais', actual: totalBytes, limit: MAX_TOTAL_BYTES });
}
if (totalLines > MAX_TOTAL_LINES) {
  failures.push({ scope: 'combined', rule: 'linhas totais', actual: totalLines, limit: MAX_TOTAL_LINES });
}

const output = {
  ok: failures.length === 0,
  entity,
  limits: {
    maxFilesPerScope: MAX_FILES_PER_SCOPE,
    maxBytesPerFile: MAX_BYTES_PER_FILE,
    maxLinesPerFile: MAX_LINES_PER_FILE,
    maxTotalBytes: MAX_TOTAL_BYTES,
    maxTotalLines: MAX_TOTAL_LINES
  },
  totals: {
    backend: { files: backend.length, ...backendTotals },
    frontend: { files: frontend.length, ...frontendTotals },
    combined: { files: backend.length + frontend.length, bytes: totalBytes, lines: totalLines }
  },
  failures
};

if (json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Orcamento dos artefatos gerados para ${entity}`);
  console.log(`Backend: ${backend.length} arquivo(s), ${backendTotals.bytes} bytes, ${backendTotals.lines} linhas`);
  console.log(`Frontend: ${frontend.length} arquivo(s), ${frontendTotals.bytes} bytes, ${frontendTotals.lines} linhas`);
  console.log(`Total: ${totalBytes} bytes, ${totalLines} linhas`);
  for (const failure of failures) {
    console.error(`[ERRO] ${failure.scope} ${failure.rule}: ${failure.actual} > ${failure.limit}${failure.path ? ` em ${failure.path}` : ''}`);
  }
}

if (failures.length > 0) process.exit(1);
