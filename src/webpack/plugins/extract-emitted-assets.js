/* global getDefault */
const path = require('path');
const fs = require('fs');
const normalizeAssets = getDefault(require('../utils/normalizeAssets'));

class ExtractEmittedAssets {
  constructor(options) {
    this.outputPath = options.outputPath;
    this.outputName = options.outputName || 'assets.json';
    this.hooks = {};
  }

  apply(compiler) {
    compiler.hooks.done.tap({ name: 'ExtractEmittedAssets' }, (webpackStatsObj) => {
      if (webpackStatsObj.hasErrors()) return false;

      const outputPath = this.outputPath || webpackStatsObj.toJson().outputPath;
      const assetsByChunkName = normalizeAssets(webpackStatsObj);
      const outputFile = path.join(path.resolve(outputPath), this.outputName);
      fs.writeFileSync(outputFile, JSON.stringify(assetsByChunkName), 'utf-8');
      return true;
    });
  }
}

module.exports = ExtractEmittedAssets;
