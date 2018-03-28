const prodWebConfig = require("../../webpack/prod/web.config");
const prodNodeServerConfig = require("../../webpack/prod/node-server.config");
const webpack = require("webpack");
const testUtils = require("../utils/util");

describe("WEB --env=prod", () => {

  test("Should be an object", () => {
    expect(prodWebConfig)
      .toBeInstanceOf(Object);
  });

  test("Should have only a single entry point", () => {
    expect(prodWebConfig.entry)
      .toBeInstanceOf(Object);
  });

  test("Client entry should be an array", () => {
    expect(prodWebConfig.entry.client)
      .toBeInstanceOf(Array);
  });

  test("Configuration should be valid webpack schema", () => {
    const validationError = webpack.validate(prodWebConfig);
    expect(validationError.length)
      .toBe(0);
  });

  test("Configuration should be compilable", () => {
    const compiler = webpack(prodWebConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.Compiler);
  });

});

describe("Node Server --env=prod", () => {

  test("should be an object", () => {
    expect(prodNodeServerConfig)
      .toBeInstanceOf(Object);
  });

  test("Should have only single entry point (string)", () => {
    expect(typeof prodNodeServerConfig.entry)
      .toBe("string");
  });

  test("Configuration should be valid webpack schema", () => {
    const validationError = webpack.validate(prodNodeServerConfig);
    expect(validationError.length)
      .toBe(0);
  });

});

describe("Total Compilation should work", () => {
  jest.setTimeout(1200000); // 20 minutes
  test("Compile & Run Web & NodeServer", () => {
    return new Promise((resolve, reject) => {
      webpack(prodWebConfig, (webError, webStats) => {

        // 2. Fail test if there are errors
        if (webError) {
          return reject(webError);
        } else if (webStats.hasErrors()) {
          return reject(webStats.toString());
        }

        webpack(prodNodeServerConfig, (nodeServerError, nodeServerStats) => {
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
