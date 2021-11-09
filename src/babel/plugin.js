const { getDefault } = require('../globals');
const reactRefresh = getDefault(require('react-refresh/babel'));
const lodash = getDefault(require('babel-plugin-lodash'));
const syntaxDynamicImport = getDefault(require('@babel/plugin-syntax-dynamic-import'));
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
    lodash,
    o.hot && reactRefresh,
  ].filter(Boolean);
};
