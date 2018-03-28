const _ = require("lodash");

module.exports = function(webpackStats) {
  let assets = {};
  webpackStats = webpackStats.toJson();
  if (!webpackStats.children || webpackStats.children.length <= 1) {
    webpackStats = [webpackStats];
  } else {
    webpackStats = webpackStats.children;
  }

  _.each(webpackStats, stat => {
    const assetsByChunkName = stat.assetsByChunkName;

    const publicPath = stat.publicPath;
    _.each(assetsByChunkName, (chunkValue, chunkName) => {

      // If its array then it just contains chunk value as array
      if (_.isArray(chunkValue)) {
        _.each(chunkValue, (path, index) => {
          assetsByChunkName[chunkName][index] = `${publicPath}${path}`;
        });
      } else if (_.isObject(chunkValue)) {
        _.each(chunkValue, (subChunkValues, subChunkType) => {
          _.each(subChunkValues, (subChunkValue, subChunkIndex) => {
            assetsByChunkName[chunkName][subChunkType][subChunkIndex] = `${publicPath}${subChunkValue}`;
          });
        });
      } else if (_.isString(chunkValue)) {
        assetsByChunkName[chunkName] = `${publicPath}${chunkValue}`;
      }
    });

    assets = {...assetsByChunkName};
  });
  return assets;
};
