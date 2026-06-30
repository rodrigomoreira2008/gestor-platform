#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { parseGestorForm } from '@gestor/dsl';
import { generateReactForm } from '@gestor/generator';
import { dfmToGestorForm, parseDfm } from '@gestor/parser';

interface CliOptions {
  input?: string;
  output?: string;
  reactOutput?: string;
  pretty: boolean;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.input) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const inputPath = resolve(options.input);
  const outputPath = resolve(options.output ?? defaultDslOutputPath(options.input));

  const content = await readFile(inputPath, 'utf8');
  const dfmResult = parseDfm(content);
  const form = parseGestorForm(dfmToGestorForm(dfmResult, basename(inputPath)));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(form, null, options.pretty ? 2 : 0), 'utf8');

  console.log(`DSL gerada: ${outputPath}`);

  if (options.reactOutput) {
    const reactOutputPath = resolve(options.reactOutput);
    const reactCode = generateReactForm(form);
    await mkdir(dirname(reactOutputPath), { recursive: true });
    await writeFile(reactOutputPath, reactCode, 'utf8');
    console.log(`React gerado: ${reactOutputPath}`);
  }

  if (dfmResult.warnings.length > 0) {
    console.warn('Avisos:');
    for (const warning of dfmResult.warnings) console.warn(`- ${warning}`);
  }
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { pretty: true };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--input' || arg === '-i') {
      options.input = args[++index];
      continue;
    }

    if (arg === '--output' || arg === '-o') {
      options.output = args[++index];
      continue;
    }

    if (arg === '--react-output') {
      options.reactOutput = args[++index];
      continue;
    }

    if (arg === '--compact') {
      options.pretty = false;
      continue;
    }

    if (!options.input) {
      options.input = arg;
    }
  }

  return options;
}

function defaultDslOutputPath(input: string): string {
  return input.replace(/\.dfm$/i, '.gestor.json');
}

function printUsage(): void {
  console.log(`Uso:\n  gestor-converter --input CadastroPedidos.dfm --output CadastroPedidos.gestor.json --react-output CadastroPedidosPage.tsx\n\nOpções:\n  -i, --input       Caminho do arquivo .dfm\n  -o, --output      Caminho do arquivo DSL gerado\n  --react-output    Caminho do componente React gerado\n  --compact         Gera JSON sem indentação`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
