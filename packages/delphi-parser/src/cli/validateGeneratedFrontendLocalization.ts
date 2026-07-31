import { readFileSync } from 'node:fs';
import { generateFrontendFiles, resolveDelphiForm } from '../index';

interface GeneratedFile { path: string; content: string; }
interface Finding { file: string; rule: string; detail: string; }

const args = process.argv.slice(2).filter((argument) => argument !== '--json');
const json = process.argv.includes('--json');
const [dfmPath, pasPath, entity, table] = args;

if (!dfmPath || !pasPath || !entity) {
  console.error('Uso: validate:frontend-localization arquivo.dfm arquivo.pas entidade [tabela] [--json]');
  process.exit(1);
}

const resolved = resolveDelphiForm(readFileSync(dfmPath, 'utf8'), readFileSync(pasPath, 'utf8'), { entity, table });
const generated = generateFrontendFiles(resolved) as GeneratedFile[];
const sourceFiles = generated.filter((file) => /\.(ts|tsx)$/.test(file.path));
const findings: Finding[] = [];
let localeUsages = 0;
let userMessages = 0;

const forbiddenEnglish = [
  ['New', 'Novo'],
  ['Edit', 'Editar'],
  ['Delete', 'Excluir'],
  ['Cancel', 'Cancelar'],
  ['Save', 'Salvar'],
  ['Search', 'Pesquisar'],
  ['Loading', 'Carregando'],
  ['Error', 'Erro']
] as const;

for (const file of sourceFiles) {
  const content = file.content;
  localeUsages += count(content, /toLocaleLowerCase\(['"]pt-BR['"]\)/g);
  userMessages += count(content, />[^<{\n][^<{]*</g);
  userMessages += count(content, /(?:placeholder|aria-label|headerName)=?[{: ]*['"][^'"]+['"]/g);

  if (/toLocaleLowerCase\(\)/.test(content)) {
    findings.push({ file: file.path, rule: 'locale-explicito', detail: 'toLocaleLowerCase deve informar pt-BR' });
  }
  if (/toLocaleUpperCase\(\)/.test(content)) {
    findings.push({ file: file.path, rule: 'locale-explicito', detail: 'toLocaleUpperCase deve informar pt-BR' });
  }
  if (/\.localeCompare\([^,\n)]+\)/.test(content)) {
    findings.push({ file: file.path, rule: 'locale-explicito', detail: 'localeCompare deve informar pt-BR' });
  }

  for (const [english, portuguese] of forbiddenEnglish) {
    const pattern = new RegExp(`(?:>|['"\\s])${english}(?:<|['"\\s:])`, 'g');
    if (pattern.test(content)) {
      findings.push({ file: file.path, rule: 'texto-usuario-pt-br', detail: `texto em ingles "${english}"; prefira "${portuguese}"` });
    }
  }

  if (/placeholder=['"]Search/i.test(content)) {
    findings.push({ file: file.path, rule: 'placeholder-pt-br', detail: 'placeholder de pesquisa deve estar em portugues' });
  }
  if (/aria-label=['"](?:Edit|Delete|Close|Add)['"]/i.test(content)) {
    findings.push({ file: file.path, rule: 'aria-label-pt-br', detail: 'aria-label de acao deve estar em portugues' });
  }
}

const pageFile = generated.find((file) => file.path.endsWith(`/pages/${entity}Page.tsx`))
  ?? generated.find((file) => file.path.includes('/pages/') && file.path.endsWith('Page.tsx'));
if (!pageFile) {
  findings.push({ file: '(geracao)', rule: 'pagina-obrigatoria', detail: 'pagina CRUD nao foi gerada' });
} else {
  for (const expected of ['Novo', 'Editar', 'Excluir', 'Cancelar', 'Pesquisar']) {
    if (!pageFile.content.includes(expected)) {
      findings.push({ file: pageFile.path, rule: 'vocabulário-crud', detail: `texto esperado ausente: ${expected}` });
    }
  }
  if (!pageFile.content.includes("toLocaleLowerCase('pt-BR')")) {
    findings.push({ file: pageFile.path, rule: 'busca-pt-br', detail: 'busca textual deve normalizar usando pt-BR' });
  }
}

const ok = findings.length === 0;
const runtimeMarker = ok ? `FRONTEND_LOCALIZATION_OK:${entity}:files=${sourceFiles.length}:locale=${localeUsages}:messages=${userMessages}` : null;
const report = {
  ok,
  entity,
  generatedFiles: generated.length,
  inspectedFiles: sourceFiles.length,
  locale: 'pt-BR',
  localeUsages,
  userMessages,
  findings,
  runtimeMarker,
  diagnostics: findings.map((finding) => `${finding.file} [${finding.rule}] ${finding.detail}`)
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  if (runtimeMarker) console.log(runtimeMarker);
  for (const diagnostic of report.diagnostics) console.error(diagnostic);
}

if (!ok) process.exit(1);

function count(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}
