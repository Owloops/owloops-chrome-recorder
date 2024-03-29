import { parse, stringify, stringifyStep, Schema } from "@puppeteer/replay";
import { OwloopsStringifyExtension } from "./OwloopsStringifyExtension.js";

export interface Options {
  /** @default true */
  stripWhitespace?: boolean;
}

export function stripJsonTrailingCommas(
  content: string,
  options: Options = {}
): string {
  if (options.stripWhitespace ?? true) {
    /**
     * preceded by number or string or boolean (true/false) or null or '}' or ']'
     * match with 0 or more spaces and ','
     * followed by '}' or ']'
     */
    return content.replace(
      /(?<=(true|false|null|["\d}\]])\s*)\s*,(?=\s*[}\]])/g,
      ""
    );
  }

  /**
   * preceded by number or string or boolean (true/false) or null or '}' or ']' (and with 0 or more spaces)
   * match with ','
   * followed by '}' or ']'
   */
  return content.replace(
    /(?<=(true|false|null|["\d}\]])\s*),(?=\s*[}\]])/g,
    ""
  );
}

export function removeSourceMap(content: string): string {
  return content.slice(0, content.lastIndexOf("//# recorderSourceMap"));
}

export function parseRecordingContent(
  recordingContent: string
): Schema.UserFlow {
  // fix: https://github.com/cypress-io/cypress-chrome-recorder/issues/51
  const res = JSON.parse(recordingContent, (key, value) => {
    if ((value && value.type === "keyDown") || value.type === "keyUp") {
      if (!value.key) {
        value.key = "key";
      }
    }
    return value;
  });
  return parse(res);
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
      "No recordings found. Please create and upload one before trying again."
    );

    return;
  }

  const parsedRecording = parseRecordingContent(recording);

  const owloopsStringified = await stringifyParsedRecording(parsedRecording);

  const owloopsStringifiedWithoutTrailingCommas = stripJsonTrailingCommas(
    owloopsStringified || ""
  );

  const owloopsStringifiedWithoutTrailingCommasWithoutSourceMap =
    removeSourceMap(owloopsStringifiedWithoutTrailingCommas);

  const owloopsStringifiedWithoutTrailingCommasWithoutSourceMapBeautified =
    JSON.stringify(
      JSON.parse(owloopsStringifiedWithoutTrailingCommasWithoutSourceMap),
      null,
      2
    );

  return owloopsStringifiedWithoutTrailingCommasWithoutSourceMapBeautified;
}
