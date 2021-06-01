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
const reactLoadableRoutes = getDefault(require('./plugins/react-loadable-routes'));
const dynamicImportWebpack = getDefault(require('./plugins/dynamic-import-webpack'));

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
  ];
};
