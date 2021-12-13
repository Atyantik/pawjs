const { getDefault } = require('../globals');
const reactRefresh = getDefault(require('react-refresh/babel'));
const lodash = getDefault(require('babel-plugin-lodash'));

// We require both plugins below for proper mapping of modules with routes!
// Do not delete untill you know what you are doing.
const replaceDynamicImportWebpack = getDefault(require('./plugins/dynamic-import-webpack'));
const reactLoadableRoutes = getDefault(require('./plugins/react-loadable-routes'));

module.exports = (options = { hotRefresh: false, useDynamicImport: false }) => {
  return [
    replaceDynamicImportWebpack(options.useDynamicImport),
    reactLoadableRoutes,
    lodash,
    options.hotRefresh && reactRefresh,
  ].filter(Boolean);
};
