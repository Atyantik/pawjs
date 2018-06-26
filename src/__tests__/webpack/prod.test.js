const path = require("path");

process.env.__lib_root = path.resolve(__dirname, "../../../");
process.env.__project_root = path.resolve(process.env.__lib_root, "demo");

let wHandler = require("../../webpack").handler;

const prodWebConfig = wHandler.getConfig("production", "web");
const prodNodeServerConfig = wHandler.getConfig("production", "server");

const webpack = require("webpack");
const testUtils = require("../__test_utils/util");

describe("WEB --env=prod", () => {


  test("should be an object", () => {
    expect(prodWebConfig)
      .toBeInstanceOf(Object);
  });

  test("Should have only single entry point", () => {
    prodWebConfig.forEach(dwc => {
      expect(dwc.entry)
        .toBeInstanceOf(Object);
    });

  });

  test("Client Entry should be an array", () => {
    prodWebConfig.forEach(dwc => {
      expect(dwc.entry.client)
        .toBeInstanceOf(Array);
    });

  });

  test("Configuration should be valid webpack schema", () => {
    const validationError = webpack.validate(prodWebConfig);
    expect(validationError)
      .toHaveLength(0);
  });

  test("Configuration should be compilable", () => {
    const compiler = webpack(prodWebConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.MultiCompiler);
  });
});

describe("Node Server --env=prod", () => {

  test("should be an object", () => {

    expect(prodNodeServerConfig)
      .toBeInstanceOf(Object);
  });

  test("Should have only single entry point (string)", () => {
    prodNodeServerConfig.forEach(dnc => {
      expect(typeof dnc.entry)
        .toBe("string");
    });
  });

  test("Configuration should be valid webpack schema", () => {
    const validationError = webpack.validate(prodNodeServerConfig);
    expect(validationError)
      .toHaveLength(0);
  });

  test("Configuration should be compilable", () => {
    const compiler = webpack(prodNodeServerConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.MultiCompiler);
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