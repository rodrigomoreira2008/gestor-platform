#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import { parseGestorForm } from '@gestor/dsl';
import { generateReactForm } from '@gestor/generator';
import { dfmToGestorForm, parseDfm, parsePas } from '@gestor/parser';

interface CliOptions {
  input?: string;
  output?: string;
  reactOutput?: string;
  pasReportOutput?: string;
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
  const extension = extname(inputPath).toLowerCase();

  if (extension === '.pas') {
    await convertPas(inputPath, options);
    return;
  }

  await convertDfm(inputPath, options);
}

async function convertDfm(inputPath: string, options: CliOptions): Promise<void> {
  const outputPath = resolve(options.output ?? defaultDslOutputPath(inputPath));
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

async function convertPas(inputPath: string, options: CliOptions): Promise<void> {
  const outputPath = resolve(options.pasReportOutput ?? options.output ?? defaultPasReportOutputPath(inputPath));
  const content = await readFile(inputPath, 'utf8');
  const report = parsePas(content);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(report, null, options.pretty ? 2 : 0), 'utf8');

  console.log(`Relatório PAS gerado: ${outputPath}`);
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

    if (arg === '--pas-report-output') {
      options.pasReportOutput = args[++index];
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

function defaultPasReportOutputPath(input: string): string {
  return input.replace(/\.pas$/i, '.pas-report.json');
}

function printUsage(): void {
  console.log(`Uso:\n  gestor-converter --input CadastroPedidos.dfm --output CadastroPedidos.gestor.json --react-output CadastroPedidosPage.tsx\n  gestor-converter --input CadastroPedidos.pas --pas-report-output CadastroPedidos.pas-report.json\n\nOpções:\n  -i, --input             Caminho do arquivo .dfm ou .pas\n  -o, --output            Caminho do arquivo gerado\n  --react-output          Caminho do componente React gerado para .dfm\n  --pas-report-output     Caminho do relatório técnico gerado para .pas\n  --compact               Gera JSON sem indentação`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
