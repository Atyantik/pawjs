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

module.exports = Object.assign({}, config);