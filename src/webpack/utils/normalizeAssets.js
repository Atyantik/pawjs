const _ = require("lodash");

module.exports = function(webpackStats) {
  let assets = {};
  let cssDependencyMap = [];
  webpackStats = webpackStats.toJson();

  if (!_.isArray(webpackStats)) {
    webpackStats = [webpackStats];
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

    _.each(stat.chunks, chunk => {
      let hasCSS = false;
      let cssFileName = "";
      _.each(chunk.files, f => {
        if (hasCSS) return;

        hasCSS = f.indexOf(".css") !== -1;
        if (hasCSS) cssFileName = f;
      });

      if (!hasCSS) return;

      cssDependencyMap.push({
        path: `${publicPath}${cssFileName}`,
        modules: _.map(chunk.modules, "name")
      });

    });

    assets = {...assetsByChunkName, cssDependencyMap};
  });

  return assets;
};
