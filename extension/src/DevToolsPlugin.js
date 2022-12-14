import { owloopsStringifyChromeRecording } from '@owloops/chrome-recorder';

export class RecorderPlugin {
  async stringify(recording) {
    return await owloopsStringifyChromeRecording(JSON.stringify(recording));
  }

  // TODO: provide exported step transform function
  async stringifyStep(step) {
    return JSON.stringify(step);
  }
}

/* eslint-disable no-undef */
chrome.devtools.recorder.registerRecorderExtensionPlugin(
  new RecorderPlugin(),
  /* name=*/ 'Owloops Test',
  /* mediaType=*/ 'application/json'
);
