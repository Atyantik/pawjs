const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const defaultConfig = require("./defaults.json");

let config = {};

if(fs.existsSync(
  path.join(process.env.__project_root, "pawconfig.json")
)) {
  config = require(path.resolve(path.join(process.env.__project_root, "pawconfig.json")));
  if (config && config.default) {
    config = config.default;
    // Add validations in future
  }
}

module.exports = _.defaultsDeep(config, defaultConfig);
module.exports.env = (env = "") => {
  if (!env) {
    return _.defaultsDeep(config, defaultConfig);
  }
  return _.defaultsDeep(_.get(config, env, {}), _.get(defaultConfig, env, {}));
};