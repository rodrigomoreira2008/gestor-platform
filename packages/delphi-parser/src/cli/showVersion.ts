import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PackageMetadata {
  name?: string;
  version?: string;
}

const packagePath = resolve(process.cwd(), 'package.json');
let metadata: PackageMetadata;

try {
  metadata = JSON.parse(readFileSync(packagePath, 'utf8')) as PackageMetadata;
} catch (error) {
  console.error(`Nao foi possivel ler ${packagePath}: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  process.exit(1);
}

if (!metadata.name || !metadata.version) {
  console.error('package.json sem nome ou versao.');
  process.exit(1);
}

const result = {
  name: metadata.name,
  version: metadata.version,
  node: process.versions.node,
  platform: process.platform,
  architecture: process.arch
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`${result.name} v${result.version}`);
  console.log(`Node.js ${result.node} | ${result.platform}/${result.architecture}`);
}
