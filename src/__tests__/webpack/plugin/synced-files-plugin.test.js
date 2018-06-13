const SyncedFilesPlugins = require("../../../webpack/plugins/synced-files-plugin");
const path = require("path");
const webpack = require("webpack");

describe("Synced Files Plugin Tests:", () => {
  test("Should throw error on invalid output path", () => {
    expect(new Promise((resolve, reject) => {
      try {
        const syncedFilesPlugin = new SyncedFilesPlugins({
          outputPath: "/path/that/does/not/exists"
        });
        const compiler = webpack({
          entry: "./a.js",
          context: path.resolve(path.join(__dirname, "../fixtures"))
        });
        syncedFilesPlugin.apply(compiler);
        compiler.hooks.done.callAsync({
          hasErrors: () => {},
          toJson: () => {},
        }, (err) => {
          if(err) return reject(1);
          resolve();
        });
      } catch(ex) {
        reject(1);
      }
    })).rejects.toEqual(1);
  });
});