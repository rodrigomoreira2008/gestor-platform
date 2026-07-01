import { readFileSync } from 'node:fs';
import { collectActionBindings, collectFieldBindings, parseDfm } from '../index';

const [, , filePath] = process.argv;

if (!filePath) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser parse:dfm <arquivo.dfm>');
  process.exit(1);
}

const content = readFileSync(filePath, 'utf8');
const parsed = parseDfm(content);

if (!parsed.root) {
  console.error('Não foi possível identificar o formulário raiz do DFM.');
  process.exit(1);
}

const output = {
  form: {
    name: parsed.root.name,
    className: parsed.root.className,
    caption: parsed.root.properties.Caption
  },
  warnings: parsed.warnings,
  fields: collectFieldBindings(parsed.root),
  actions: collectActionBindings(parsed.root)
};

console.log(JSON.stringify(output, null, 2));
