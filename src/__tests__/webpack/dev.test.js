const path = require("path");

process.env.__lib_root = path.resolve(__dirname, "../../../");
process.env.__project_root = path.resolve(process.env.__lib_root, "demo");

const wHandler = require("../../webpack").handler;

const devWebConfig = wHandler.getConfig("development", "web");
const devNodeServerConfig = wHandler.getConfig("development", "server");

const webpack = require("webpack");
const testUtils = require("../__test_utils/util");

describe("WEB --env=dev", () => {


  test("should be an object", () => {
    expect(devWebConfig)
      .toBeInstanceOf(Object);
  });

  test("Should have only single entry point", () => {
    devWebConfig.forEach(dwc => {
      expect(dwc.entry)
        .toBeInstanceOf(Object);
    });

  });

  test("Client Entry should be an array", () => {
    devWebConfig.forEach(dwc => {
      expect(dwc.entry.client)
        .toBeInstanceOf(Array);
    });

  });

  test("Configuration should be valid webpack schema", () => {
    const validationError = webpack.validate(devWebConfig);
    expect(validationError).toHaveLength(0);
  });

  test("Configuration should be compilable", () => {
    const compiler = webpack(devWebConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.MultiCompiler);
  });
});

describe("Node Server --env=dev", () => {

  test("should be an object", () => {

    expect(devNodeServerConfig)
      .toBeInstanceOf(Object);
  });

  test("Should have only single entry point (string)", () => {
    devNodeServerConfig.forEach(dnc => {
      expect(typeof dnc.entry)
        .toBe("string");
    });
  });

  test("Configuration should be valid webpack schema", () => {
    const validationError = webpack.validate(devNodeServerConfig);
    expect(validationError).toHaveLength(0);
  });

  test("Configuration should be compilable", () => {
    const compiler = webpack(devNodeServerConfig);
    expect(compiler)
      .toBeInstanceOf(webpack.MultiCompiler);
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