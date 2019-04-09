const fs = require('fs');
const path = require('path');

let cacheEnabled = true;

/**
 * As this is a mixture of ES6 and ES5 we require almost module that might
 * be exported as default or using the old module.exports
 * @param m array | object | any
 * @returns {*}
 */
/* global getDefault */
global.getDefault = global.getDefault || (m => (m.default ? m.default : m));
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
const babelServer = getDefault(require('../../babel/node.js'))({
  cacheDirectory: cacheEnabled,
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
    // Allow @pawjs core & pawjs- plguins to be of es6 or TS format
    /node_modules\/(?!(@pawjs|pawjs-)).*/,
  ],
  extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx', '.ts', '.tsx'],
});


if (!process.env.PROJECT_ROOT) {
  // eslint-disable-next-line
  const CliHandler = getDefault(require('../../scripts/cli'));
  // eslint-disable-next-line
  const cli = new CliHandler();
}
const directories = require('../utils/directories');

const emptyClass = path.resolve(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyClass.js');
const projectClientPath = `${process.env.PROJECT_ROOT}/src/client.js`;
const projectClientExists = fs.existsSync(projectClientPath);

const projectServerPath = `${process.env.PROJECT_ROOT}/src/server.js`;
const projectServerExists = fs.existsSync(projectServerPath);

const commonResolvers = [
  'node_modules',
  path.resolve(path.join(directories.root, 'node_modules')),
];

if (
  process.env.LIB_ROOT !== process.cwd()
  && process.env.LIB_ROOT !== path.resolve(process.cwd(), '..')
) {
  if (fs.existsSync(path.join(process.env.LIB_ROOT, 'node_modules'))) {
    commonResolvers.push(path.join(process.env.LIB_ROOT, 'node_modules'));
  }

  if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', 'node_modules'))) {
    commonResolvers.push(path.join(process.env.LIB_ROOT, '..', 'node_modules'));
  }

  if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', '..', 'node_modules'))) {
    commonResolvers.push(path.join(process.env.LIB_ROOT, '..', '..', 'node_modules'));
  }

  if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', '..', '..', 'node_modules'))) {
    commonResolvers.push(path.join(process.env.LIB_ROOT, '..', '..', '..', 'node_modules'));
  }
}

const loaderResolver = commonResolvers.slice(0);
loaderResolver.push(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'loaders'));
const resolver = {
  resolve: {
    alias: {
      pawjs: path.resolve(path.join(process.env.LIB_ROOT)),
      pawProjectClient: projectClientExists ? projectClientPath : emptyClass,
      pawProjectServer: projectServerExists ? projectServerPath : emptyClass,
    },
    modules: commonResolvers,
    extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx', '.ts', '.tsx'],
  },
  resolveLoader: {
    modules: loaderResolver,
  },
};
module.exports = resolver;
