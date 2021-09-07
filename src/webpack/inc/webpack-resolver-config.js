const fs = require('fs');
const path = require('path');
const supportedExtensions = require('../../extensions.js');
const packageJson = require('../../../package.json');

const libRoot = path.resolve(
  path.join(
    __dirname,
    '..',
    '..',
    '..',
  ),
);
const root = process.cwd();

const libraryNodeModules = path.join(libRoot, 'node_modules');
const libraryHasNodeModules = libraryNodeModules ? fs.existsSync(libraryNodeModules) : false;

const emptyClass = pawExistsSync(path.join(libRoot, 'src', 'webpack', 'utils', 'emptyClass'));
const emptyFunction = pawExistsSync(path.join(libRoot, 'src', 'webpack', 'utils', 'emptyFunction'));
const emptyObject = pawExistsSync(path.join(libRoot, 'src', 'webpack', 'utils', 'emptyObject'));
const projectClientPath = pawExistsSync(`${root}/src/client`);
const projectSWPath = pawExistsSync(`${root}/src/sw`);
const projectServerPath = pawExistsSync(`${root}/src/server`);
const projectRoutesPath = pawExistsSync(`${root}/src/routes`);
const projectSeoConfig = pawExistsSync(`${root}/src/seo`);
const projectPwaConfig = pawExistsSync(`${root}/src/pwa`);

const resolveFirstToLibDependencies = (dependencies) => {
  const resolvedDependencies = {};
  Object.keys(dependencies).forEach((dependency) => {
    resolvedDependencies[dependency] = fs.existsSync(path.join(libraryNodeModules, dependency))
      ? path.resolve(path.join(libraryNodeModules, dependency))
      : path.resolve(path.join(root, 'node_modules', dependency));
  });
  return resolvedDependencies;
};

/**
 * Resolve dependencies in the library's node_modules as priority
 */
const dependenciesAlias = resolveFirstToLibDependencies(packageJson.dependencies);

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

const resolver = {
  resolve: {
    alias: {
      ...dependenciesAlias,
      pawjs: libRoot,
      pawProjectClient: projectClientPath || emptyClass,
      pawProjectSW: projectSWPath || emptyFunction,
      pawProjectServer: projectServerPath || emptyClass,
      pawProjectRoutes: projectRoutesPath || emptyClass,
      pawPwaConfig: projectPwaConfig || emptyObject,
      pawSeoConfig: projectSeoConfig || emptyObject,
    },
    extensions: supportedExtensions.resolveExtensions,
  },
  resolveLoader: {
    modules: [
      'node_modules',
      ...(libraryHasNodeModules ? [libraryNodeModules] : []),
      path.join(process.env.LIB_ROOT, 'src', 'webpack', 'loaders'),
    ],
  },
};
module.exports = resolver;
