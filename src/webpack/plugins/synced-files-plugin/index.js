const path = require("path");
const fs = require("fs");

class SyncedFilesPlugin {

  constructor(options = {}) {
    this.outputFileName = options.outputFileName || "synced-files.json";
    this.outputPath = options.outputPath || "";
    this.deleteAfterCompile = !!options.deleteAfterCompile;
    this.hooks = {};
    this.syncedFiles = {};
  }

  static loader(requestedLoaders) {
    return [{
      loader: require.resolve("./loader"),
      options: {
        requestedLoaders
      }
    }];
  }
  apply(compiler) {
    compiler.hooks.beforeRun.tap({name: "LoadPreviouslySyncedFilesMap"}, () => {
      const outputPath = this.outputPath || compiler.outputPath;
      try {
        const outputFile = path.join(path.resolve(outputPath), this.outputFileName);
        if (!path.resolve(outputPath) || !fs.existsSync(outputFile)) return;
        this.syncedFiles = JSON.parse(fs.readFileSync(outputFile, "utf-8"));

      } catch(ex) {/* Ignore error! */}
    });

    compiler.hooks.done.tap({name: "ExtractEmittedFileMap"}, (webpackStatsObj) => {

      if (webpackStatsObj.hasErrors()) return false;

      // get emitted assets when done with compilation
      const webpackStats = webpackStatsObj.toJson();
      let outputPath = this.outputPath || webpackStats.outputPath;

      if (!fs.existsSync(path.resolve(outputPath))) {
        throw `Invalid path: ${outputPath}. Cannot emit ${this.outputFileName}`;
      }

      const outputFile = path.join(path.resolve(outputPath), this.outputFileName);

      if (this.deleteAfterCompile) {
        fs.existsSync(outputFile) && fs.unlinkSync(outputFile);
        return;
      }
      if (webpackStats && Object.keys(webpackStats).length && webpackStats["assetsByChunkName"]) {
        fs.writeFileSync(outputFile, JSON.stringify(this.syncedFiles), "utf-8");
      }
    });
  }
  add(key, value) {
    if (!key || !value) return;
    this.syncedFiles[key] = value;
  }
  get(key) {
    if (!key || !this.syncedFiles[key]) return "";
    return this.syncedFiles[key];
  }
}

module.exports = SyncedFilesPlugin;
