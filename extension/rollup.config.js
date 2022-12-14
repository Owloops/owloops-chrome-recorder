import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/DevToolsPlugin.js',
  output: {
    file: 'build/DevToolsPlugin.js',
    format: 'iife'
  },
  plugins: [nodeResolve({
    resolveOnly: ['@owloops/chrome-recorder', '@puppeteer/replay']
  })]
};
