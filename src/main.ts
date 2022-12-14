import { parse, stringify, stringifyStep, Schema } from '@puppeteer/replay';
import { OwloopsStringifyExtension } from './OwloopsStringifyExtension.js';

export interface Options {
  /** @default true */
  stripWhitespace?: boolean;
}

export function stripJsonTrailingCommas(content: string, options: Options = {}): string {
  if (options.stripWhitespace ?? true) {
    /**
     * preceded by number or string or boolean (true/false) or null or '}' or ']'
     * match with 0 or more spaces and ','
     * followed by '}' or ']'
     */
    return content.replace(/(?<=(true|false|null|["\d}\]])\s*)\s*,(?=\s*[}\]])/g, '');
  }

  /**
   * preceded by number or string or boolean (true/false) or null or '}' or ']' (and with 0 or more spaces)
   * match with ','
   * followed by '}' or ']'
   */
  return content.replace(/(?<=(true|false|null|["\d}\]])\s*),(?=\s*[}\]])/g, '');
}

export function parseRecordingContent(
  recordingContent: string
): Schema.UserFlow {
  return parse(JSON.parse(recordingContent));
}

export async function stringifyParsedRecording(
  parsedRecording: Schema.UserFlow
): Promise<Promise<string> | undefined> {
  return await stringify(parsedRecording, {
    extension: new OwloopsStringifyExtension(),
  });
}

export async function stringifyParsedStep(step: Schema.Step): Promise<string> {
  return await stringifyStep(step, {
    extension: new OwloopsStringifyExtension(),
  });
}

export async function owloopsStringifyChromeRecording(
  recording: string
): Promise<string | undefined> {
  // If no recordings found, log message and return.
  if (recording.length === 0) {
    console.log(
      'No recordings found. Please create and upload one before trying again.'
    );

    return;
  }

  const parsedRecording = parseRecordingContent(recording);
  console.log(parsedRecording);

  const owloopsStringified = await stringifyParsedRecording(parsedRecording);

  console.log(owloopsStringified);

  const owloopsStringifiedWithoutTrailingCommas = stripJsonTrailingCommas(owloopsStringified || "");
  
  console.log(owloopsStringifiedWithoutTrailingCommas);

  const owloopsStringifiedWithoutTrailingCommasBeautified = JSON.stringify(JSON.parse(owloopsStringifiedWithoutTrailingCommas), null, 2);

  return owloopsStringifiedWithoutTrailingCommasBeautified;
}
