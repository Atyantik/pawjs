const path = require('path');
const { getDefault, pawExistsSync } = require('../globals');
const reactHotLoader = getDefault(require('react-hot-loader/babel'));
const lodash = getDefault(require('babel-plugin-lodash'));
const objectRestSpread = getDefault(require('@babel/plugin-proposal-object-rest-spread'));
const decorators = getDefault(require('@babel/plugin-proposal-decorators'));
const classProperties = getDefault(require('@babel/plugin-proposal-class-properties'));
const generatorFunctions = getDefault(require('@babel/plugin-proposal-async-generator-functions'));
const syntaxDynamicImport = getDefault(require('@babel/plugin-syntax-dynamic-import'));
const privateMethods = getDefault(require('@babel/plugin-proposal-private-methods'));
const moduleResolver = getDefault(require('babel-plugin-module-resolver'));
const reactLoadableRoutes = getDefault(require('./plugins/react-loadable-routes'));
const dynamicImportWebpack = getDefault(require('./plugins/dynamic-import-webpack'));

if (!process.env.LIB_ROOT) {
  process.env.LIB_ROOT = path.resolve(__dirname, '../../');
}
const emptyClass = pawExistsSync(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyClass'));
const emptyFunction = pawExistsSync(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyFunction'));
const emptyObject = pawExistsSync(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyObject'));
const projectClientPath = pawExistsSync(`${process.env.PROJECT_ROOT}/src/client`);
const projectSWPath = pawExistsSync(`${process.env.PROJECT_ROOT}/src/sw`);
const projectServerPath = pawExistsSync(`${process.env.PROJECT_ROOT}/src/server`);
const projectRoutesPath = pawExistsSync(`${process.env.PROJECT_ROOT}/src/routes`);
const projectSeoConfig = pawExistsSync(`${process.env.PROJECT_ROOT}/src/seo`);
const projectPwaConfig = pawExistsSync(`${process.env.PROJECT_ROOT}/src/pwa`);

const pluginDefaults = {
  noChunk: false,
  hot: true,
};

module.exports = (options) => {
  const o = { ...pluginDefaults, ...options };
  return [
    reactLoadableRoutes,
    o.noChunk ? dynamicImportWebpack : syntaxDynamicImport,
    objectRestSpread,
    [
      privateMethods,
      {
        loose: true,
      },
    ],
    [
      decorators,
      {
        legacy: true,
      },
    ],
    [
      classProperties,
      {
        loose: true,
      },
    ],
    generatorFunctions,
    lodash,
    ...(o.hot ? [reactHotLoader] : []),
    [
      moduleResolver,
      {
        "alias": {
          pawjs: path.resolve(path.join(process.env.LIB_ROOT)),
          pawProjectClient: projectClientPath || emptyClass,
          pawProjectSW: projectSWPath || emptyFunction,
          pawProjectServer: projectServerPath || emptyClass,
          pawProjectRoutes: projectRoutesPath || emptyClass,
          pawPwaConfig: projectPwaConfig || emptyObject,
          pawSeoConfig: projectSeoConfig || emptyObject,
        }
      }
    ]
  ];
};
