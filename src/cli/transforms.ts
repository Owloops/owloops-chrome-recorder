import path from 'path';
import fs, { readFileSync } from 'fs';
import chalk from 'chalk';

import { owloopsStringifyChromeRecording } from '../main.js';

const __dirname = path.resolve(path.dirname('.'));

// cli flags
type Flags = {
  force?: boolean;
  dry?: boolean;
  path?: string;
  print?: boolean;
};

interface FileToExport {
  stringifiedFile: string;
  testName: string;
  outputFolder: string;
  outputPath: string;
}

async function exportFileToFolder({
  stringifiedFile,
  testName,
  outputFolder,
  outputPath,
}: FileToExport) {
  fs.writeFile(
    path.join(outputFolder, `/${testName}.owl.json`),
    stringifiedFile as string,
    (err: any) => {
      if (!err) {
        console.log(
          chalk.green(
            `\n${testName}.json exported to ${outputPath}/${testName}.owl.json\n`
          )
        );
      }

      if (err) {
        if (err?.path?.includes('owloops/integration')) {
          const outputFolder = path.join(__dirname, 'owloops/e2e');
          const outputPath = 'owloops/e2e';

          exportFileToFolder({
            stringifiedFile,
            testName,
            outputFolder,
            outputPath,
          });
        } else {
          console.log(
            chalk.yellow(
              `\nThere was an issue writing the output to ${outputPath}. Please check that it exists and try again.`
            )
          );
        }
      }
    }
  );
}

export async function runTransforms({
  files,
  outputPath,
  flags,
}: {
  files: string[];
  outputPath: string;
  flags: Flags;
}): Promise<Promise<string | void>[] | undefined> {
  const transformPath = path.join(__dirname, '/dist/main.js');
  const outputFolder = path.join(__dirname, outputPath);
  const { dry, print } = flags;
  const args = ['-t', transformPath].concat(files);

  if (dry) {
    args.push('--dry');
  }
  if (print) {
    args.push('--print');
  }

  return files.map(async (file) => {
    console.log(chalk.green(`Running Owloops Chrome Recorder on ${file}\n`));

    const recordingContent = readFileSync(`${file}`, 'utf8');
    const stringifiedFile = await owloopsStringifyChromeRecording(
      recordingContent
    );

    if (!stringifiedFile) {
      return;
    }

    const fileName = file.split('/').pop();
    const testName = fileName ? fileName.replace('.json', '') : undefined;

    if (dry) {
      console.log(stringifiedFile);
    } else if (!testName) {
      console.log(
        chalk.red('No file or folder was found to export. Please try again.')
      );
    } else {
      exportFileToFolder({
        stringifiedFile,
        testName,
        outputFolder,
        outputPath,
      });
    }
  });
}
