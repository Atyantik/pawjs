const { getDefault } = require('../globals');
const reactRefresh = getDefault(require('react-refresh/babel'));
const lodash = getDefault(require('babel-plugin-lodash'));
const reactLoadableRoutes = getDefault(require('./plugins/react-loadable-routes'));

module.exports = (options = { hotRefresh: false }) => {
  return [
    reactLoadableRoutes,
    lodash,
    options.hotRefresh && reactRefresh,
  ].filter(Boolean);
};
