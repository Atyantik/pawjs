/* global getDefault */
const reactHotLoader = getDefault(require('react-hot-loader/babel'));
const lodash = getDefault(require('babel-plugin-lodash'));
const reactLoadableRoutes = getDefault(require('./plugins/react-loadable-routes'));

const pluginDefaults = {
  noChunk: false,
  hot: true,
};

module.exports = (options) => {
  const o = { ...pluginDefaults, ...options };
  return [
    reactLoadableRoutes,
    lodash,
    ...(o.hot ? [reactHotLoader] : []),
  ];
};
