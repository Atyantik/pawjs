const devWebConfig = require("../../webpack/dev/web.config");
const devNodeServerConfig = require("../../webpack/dev/node-server.config");
const webpack = require("webpack");
const testUtils = require("../utils/util");

describe("WEB --env=dev", () => {

  test("should be an object", () => {
    expect(devWebConfig)
      .toBeInstanceOf(Object);
  });

  test("Should have only single entry point", () => {
    expect(devWebConfig.entry)
      .toBeInstanceOf(Object);
  });

  test("Client Entry should be an array", () => {
    expect(devWebConfig.entry.client)
      .toBeInstanceOf(Array);
  });

  test("Configuration should be valid webpack schema", () => {
    const validationError = webpack.validate(devWebConfig);
    expect(validationError.length)
      .toBe(0);
  });

  test("Configuration should be compilable", () => {
    const compiler = webpack(devWebConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.Compiler);
  });
});

describe("Node Server --env=dev", () => {

  test("should be an object", () => {
    expect(devNodeServerConfig)
      .toBeInstanceOf(Object);
  });

  test("Should have only single entry point (string)", () => {
    expect(typeof devNodeServerConfig.entry)
      .toBe("string");
  });

  test("Configuration should be valid webpack schema", () => {
    const validationError = webpack.validate(devNodeServerConfig);
    expect(validationError.length)
      .toBe(0);
  });

  test("Configuration should be compilable", () => {
    const compiler = webpack(devNodeServerConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.Compiler);
  });

});


describe("Total Compilation should work", () => {
  jest.setTimeout(1200000); // 20 minutes
  test("Compile & Run Web & NodeServer", () => {
    return new Promise((resolve, reject) => {
      webpack(devWebConfig, (webError, webStats) => {

        // 2. Fail test if there are errors
        if (webError) {
          return reject(webError);
        } else if (webStats.hasErrors()) {
          return reject(webStats.toString());
        }

        webpack(devNodeServerConfig, (nodeServerError, nodeServerStats) => {
          // 2. Fail test if there are errors
          if (nodeServerError) {
            return reject(nodeServerError);
          } else if (nodeServerStats.hasErrors()) {
            return reject(nodeServerStats.toString());
          }

          testUtils.deleteFolderRecursive(webStats.toJson().outputPath);
          testUtils.deleteFolderRecursive(nodeServerStats.toJson().outputPath);
          resolve();
        });
      });
    });
  });
});