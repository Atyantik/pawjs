const fs = require('fs');
const path = require('path');
const supportedExtensions = require('../../extensions.js');

let cacheEnabled = true;

/**
 * As this is a mixture of ES6 and ES5 we require almost module that might
 * be exported as default or using the old module.exports
 * @param m array | object | any
 * @returns {*}
 */
/* global getDefault */
global.getDefault = global.getDefault || (m => (m.default ? m.default : m));

/* global pawExistsSync */
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
    // Allow @pawjs core & pawjs- plguins to be of es6 or TS format
    /node_modules\/(?!(@pawjs|pawjs-)).*/,
  ],
  extensions: supportedExtensions.resolveExtensions,
});


if (!process.env.PROJECT_ROOT) {
  // eslint-disable-next-line
  const CliHandler = getDefault(require('../../scripts/cli'));
  // eslint-disable-next-line
  (new CliHandler());
}
const directories = getDefault(require('../utils/directories'));

const emptyClass = pawExistsSync(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyClass'));
const emptyFunction = pawExistsSync(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyFunction'));
const emptyObject = pawExistsSync(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyObject'));
const projectClientPath = pawExistsSync(`${process.env.PROJECT_ROOT}/src/client`);
const projectSWPath = pawExistsSync(`${process.env.PROJECT_ROOT}/src/sw`);
const projectServerPath = pawExistsSync(`${process.env.PROJECT_ROOT}/src/server`);
const projectRoutesPath = pawExistsSync(`${process.env.PROJECT_ROOT}/src/routes`);
const projectSeoConfig = pawExistsSync(`${process.env.PROJECT_ROOT}/src/seo`);
const projectPwaConfig = pawExistsSync(`${process.env.PROJECT_ROOT}/src/pwa`);

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
      pawProjectClient: projectClientPath || emptyClass,
      pawProjectSW: projectSWPath || emptyFunction,
      pawProjectServer: projectServerPath || emptyClass,
      pawProjectRoutes: projectRoutesPath || emptyClass,
      pawPwaConfig: projectPwaConfig || emptyObject,
      pawSeoConfig: projectSeoConfig || emptyObject,
    },
    modules: commonResolvers,
    extensions: supportedExtensions.resolveExtensions,
  },
  resolveLoader: {
    modules: loaderResolver,
  },
};
module.exports = resolver;
