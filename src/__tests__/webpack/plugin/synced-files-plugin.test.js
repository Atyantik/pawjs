const path = require('path');
const webpack = require('webpack');
const SyncedFilesPlugins = require('../../../webpack/plugins/synced-files-plugin');

describe('Synced Files Plugin Tests:', () => {
  test('Should throw error on invalid output path', async () => {
    (await expect(new Promise((resolve, reject) => {
      try {
        const syncedFilesPlugin = new SyncedFilesPlugins({
          outputPath: '/path/that/does/not/exists',
        });
        const compiler = webpack({
          entry: './a.js',
          context: path.resolve(path.join(__dirname, '../fixtures')),
        });
        syncedFilesPlugin.apply(compiler);
        return compiler.hooks.done.callAsync({
          hasErrors: () => {},
          toJson: () => {},
        }, (err) => {
          // eslint-disable-next-line
          if (err) return reject(1);
          return resolve();
        });
      } catch (ex) {
        // eslint-disable-next-line
        return reject(1);
      }
    }))).rejects.toEqual(1);
  });
});
