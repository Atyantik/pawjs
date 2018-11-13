const path = require('path');
const webpack = require('webpack');

process.env.LIB_ROOT = path.resolve(__dirname, '../../../');
process.env.PROJECT_ROOT = path.resolve(process.env.LIB_ROOT, 'demo');

const wHandler = require('../../webpack');

const prodWebConfig = wHandler.getConfig('production', 'web');
const prodNodeServerConfig = wHandler.getConfig('production', 'server');
const testUtils = require('../__test_utils/util');

describe('WEB --env=prod', () => {
  test('should be an object', () => {
    expect(prodWebConfig)
      .toBeInstanceOf(Object);
  });

  test('Should have only single entry point', () => {
    prodWebConfig.forEach((dwc) => {
      expect(dwc.entry)
        .toBeInstanceOf(Object);
    });
  });

  test('Client Entry should be an array', () => {
    prodWebConfig.forEach((dwc) => {
      expect(dwc.entry.client)
        .toBeInstanceOf(Array);
    });
  });

  test('Configuration should be valid webpack schema', () => {
    const validationError = webpack.validate(prodWebConfig);
    expect(validationError)
      .toHaveLength(0);
  });

  test('Configuration should be compilable', () => {
    const compiler = webpack(prodWebConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.MultiCompiler);
  });
});

describe('Node Server --env=prod', () => {
  test('should be an object', () => {
    expect(prodNodeServerConfig)
      .toBeInstanceOf(Object);
  });

  test('Should have only single entry point (string)', () => {
    prodNodeServerConfig.forEach((dnc) => {
      expect(typeof dnc.entry)
        .toBe('string');
    });
  });

  test('Configuration should be valid webpack schema', () => {
    const validationError = webpack.validate(prodNodeServerConfig);
    expect(validationError)
      .toHaveLength(0);
  });

  test('Configuration should be compilable', () => {
    const compiler = webpack(prodNodeServerConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.MultiCompiler);
  });
});


describe('Total Compilation should work', () => {
  jest.setTimeout(1200000); // 20 minutes
  test('Compile & Run Web & NodeServer', () => new Promise((resolve, reject) => {
    webpack(prodWebConfig, (webError, webStats) => {
      // 2. Fail test if there are errors
      if (webError) {
        return reject(webError);
      } if (webStats.hasErrors()) {
        return reject(webStats.toString());
      }

      return webpack(prodNodeServerConfig, (nodeServerError, nodeServerStats) => {
        // 2. Fail test if there are errors
        if (nodeServerError) {
          return reject(nodeServerError);
        } if (nodeServerStats.hasErrors()) {
          return reject(nodeServerStats.toString());
        }

        testUtils.deleteFolderRecursive(webStats.toJson().outputPath);
        testUtils.deleteFolderRecursive(nodeServerStats.toJson().outputPath);
        return resolve();
      });
    });
  }));
});
