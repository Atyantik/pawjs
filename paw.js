#!/usr/bin/env node
const fs = require('fs');
const supportedExtensions = require('./src/extensions');
/**
 * As this is a mixture of ES6 and ES5 we require almost module that might
 * be exported as default or using the old module.exports
 * @param m array | object | any
 * @returns {*}
 */
/* global getDefault */
global.getDefault = global.getDefault || (m => (m.default ? m.default : m));

/**
 * We need to resolve the files as per the extensions at many places
 * for example we do not want to restrict people to just .js or .jsx extension
 * we need ability like fileExistsSync to compare for all extensions we have defined
 * @type {*|Function}
 */
global.pawExistsSync = global.pawExistsSync || ((filePath, fileSystem = fs) => {
  if (fileSystem.existsSync(filePath)) return filePath;
  let resolvedFilePath = '';
  supportedExtensions.javascript.forEach((jsExt) => {
    if (resolvedFilePath) {
      return;
    }
    if (fileSystem.existsSync(filePath + jsExt)) {
      resolvedFilePath = filePath + jsExt;
    }
  });
  return resolvedFilePath;
});

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
    cacheEnabled = false;
  }
});

// Get babel configuration for nodejs
const babelServer = getDefault(require('./src/babel/node.js'))({
  cacheDirectory: cacheEnabled,
  hot: false,
}).use.options;

/**
 * Use babel register so that we can use latest EcmaScript & TypeScript version
 * in included files. Also we need to make sure that any plugins for pawjs or pawjs core
 * modules needs to be access with new code directly and there should be no need for
 * compiled code even if it lies in node_modules
 */
require('@babel/register')({
  presets: getDefault(babelServer.presets),
  plugins: babelServer.plugins,
  cache: cacheEnabled,
  ignore: [
    // Allow @pawjs core & pawjs- plugins to be of es6 or TS format
    /node_modules\/(?!(@pawjs|pawjs-)).*/,
  ],
  extensions: supportedExtensions.resolveExtensions,
});

/**
 * After registering babel we can include ts files as well
 */
const CliHandler = getDefault(require('./src/scripts/cli.ts'));

const handler = new CliHandler();
handler.run();

module.exports = handler;
