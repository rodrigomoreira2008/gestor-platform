import { readFileSync } from 'node:fs';
import { parsePascalUnit } from '../pasParser';

const [, , filePath] = process.argv;

if (!filePath) {
  console.error('Uso: pnpm --filter @gestor/delphi-parser parse:pas <arquivo.pas>');
  process.exit(1);
}

const content = readFileSync(filePath, 'utf8');
const parsed = parsePascalUnit(content);

console.log(JSON.stringify(parsed, null, 2));
