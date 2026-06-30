#!/usr/bin/env node

import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, relative, resolve, dirname } from 'node:path';

interface InventoryFile {
  path: string;
  extension: string;
  size: number;
}

interface InventoryReport {
  root: string;
  generatedAt: string;
  totals: {
    files: number;
    bytes: number;
  };
  byExtension: Record<string, number>;
  delphi: {
    forms: string[];
    units: string[];
    projects: string[];
    dataModulesCandidates: string[];
  };
  files: InventoryFile[];
}

const DEFAULT_IGNORES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'bin',
  'obj',
  '__history',
  '.vs',
  '.idea',
  '.vscode'
]);

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root ?? '.');
  const output = resolve(args.output ?? 'inventory-report.json');

  const files = await scan(root, root);
  const report = createReport(root, files);

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Inventário gerado: ${output}`);
  console.log(`Arquivos: ${report.totals.files}`);
  console.log(`DFM: ${report.delphi.forms.length}`);
  console.log(`PAS: ${report.delphi.units.length}`);
}

function parseArgs(args: string[]): { root?: string; output?: string } {
  const parsed: { root?: string; output?: string } = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--root' || arg === '-r') {
      parsed.root = args[++index];
      continue;
    }

    if (arg === '--output' || arg === '-o') {
      parsed.output = args[++index];
      continue;
    }

    if (!parsed.root) parsed.root = arg;
  }

  return parsed;
}

async function scan(root: string, current: string): Promise<InventoryFile[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: InventoryFile[] = [];

  for (const entry of entries) {
    if (DEFAULT_IGNORES.has(entry.name)) continue;

    const fullPath = join(current, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await scan(root, fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;

    const metadata = await stat(fullPath);
    files.push({
      path: relative(root, fullPath).replace(/\\/g, '/'),
      extension: normalizeExtension(extname(entry.name)),
      size: metadata.size
    });
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function createReport(root: string, files: InventoryFile[]): InventoryReport {
  const byExtension: Record<string, number> = {};

  for (const file of files) {
    byExtension[file.extension] = (byExtension[file.extension] ?? 0) + 1;
  }

  const forms = files.filter((file) => file.extension === '.dfm').map((file) => file.path);
  const units = files.filter((file) => file.extension === '.pas').map((file) => file.path);
  const projects = files.filter((file) => ['.dpr', '.dproj'].includes(file.extension)).map((file) => file.path);
  const dataModulesCandidates = units.filter((path) => /dm|datamodule|dados/i.test(path));

  return {
    root,
    generatedAt: new Date().toISOString(),
    totals: {
      files: files.length,
      bytes: files.reduce((total, file) => total + file.size, 0)
    },
    byExtension,
    delphi: {
      forms,
      units,
      projects,
      dataModulesCandidates
    },
    files
  };
}

function normalizeExtension(extension: string): string {
  return extension.toLowerCase() || '<none>';
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
