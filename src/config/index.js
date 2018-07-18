const defaultConfig = require("../config/defaults.json");
const defaultsDeep = require("lodash/defaultsDeep");

let config = {};
try {
  config = require(`${process.env.__project_root}/pawconfig.json`);
} catch (ex) {
  config = {};
}
config = defaultsDeep(config, defaultConfig);
if (config.appRootUrl.endsWith("/")) {
  config.appRootUrl = config.appRootUrl.replace(/\/$/, "");
}

// Give higher priority to env PORT than any other settings, until and unless changed by user
// in hook beforeStart!
if (
  typeof process.env.PORT === "string" &&
  process.env.PORT.length &&
  process.env.PORT.trim().length
) {
  config.port = process.env.PORT.trim();
}
module.exports = Object.assign({}, config);