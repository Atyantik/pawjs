#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

let useCustomEnvPath = false;
// Read configurations from the .env as soon as possible
if (process.env.ENV_CONFIG_PATH) {
  let envFilePath = process.env.ENV_CONFIG_PATH;
  if (!path.isAbsolute(process.env.ENV_CONFIG_PATH)) {
    envFilePath = path.resolve(process.cwd(), envFilePath);
  }
  if (fs.existsSync(envFilePath)) {
    useCustomEnvPath = true;
    require('dotenv').config({
      path: envFilePath,
    });
  }
}
if (!useCustomEnvPath) {
  require('dotenv').config();
}

const { getDefault } = require('./src/globals');
const { resolveExtensions } = getDefault(require('./src/extensions'));
const presetEnv = getDefault(require('@babel/preset-env'));
const presetReact = getDefault(require('@babel/preset-react'));
const presetTypescript = getDefault(require('@babel/preset-typescript'));
const babelPlugins = getDefault(require('./src/babel/plugin'));

/**
 * @desc Set cache to enabled by default,
 * at this moment we need this cache to determine if we would like to use babel cache
 * @type {boolean}
 */
let cacheEnabled = true;

/**
 * Traverse through all the arguments and check if the user has
 * indicated if he does not want to use cache!
 */
Array.from(process.argv).forEach((arg) => {
  // Convert argument to lowercase
  const lArg = arg.toLowerCase();
  if (
    lArg.indexOf('-nc') !== false
    || lArg.indexOf('--no-cache') !== false
  ) {
    process.env.BABEL_DISABLE_CACHE = 1;
    cacheEnabled = false;
  }
});

/**
 * Use babel register so that we can use latest EcmaScript & TypeScript version
 * in included files. Also we need to make sure that any plugins for pawjs or pawjs core
 * modules needs to be access with new code directly and there should be no need for
 * compiled code even if it lies in node_modules
 */
require('@babel/register')({
  presets: [
    [
      presetEnv,
      {
        targets: { node: '12' },
      },
    ],
    presetReact,
    presetTypescript,
  ],
  plugins: babelPlugins({ hotRefresh: false }),
  cache: cacheEnabled,
  ignore: [
    // Allow @pawjs core & pawjs- plugins to be of es6 or TS format
    /node_modules\/(?!(@pawjs|pawjs-)).*/,
  ],
  extensions: resolveExtensions,
});

/**
 * After registering babel we can include typescript (TS) files as well
 */
// eslint-disable-next-line import/extensions
const CliHandler = getDefault(require('./src/scripts/cli.ts'));

const handler = new CliHandler();
handler.run();

module.exports = handler;
