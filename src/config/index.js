import defaultConfig from "../config/defaults";
import defaultsDeep from "lodash/defaultsDeep";

let config = {};
try {
  config = require(process.env.PAW_CONFIG_PATH);
} catch (ex) {
  config = {};
}
config = defaultsDeep(config, defaultConfig);
if (config.appRootUrl.endsWith("/")) {
  config.appRootUrl = config.appRootUrl.replace(/\/$/, "");
}


let resourcesBaseUrl = config.cdnUrl ? config.cdnUrl: config.appRootUrl;
if (!resourcesBaseUrl.endsWith("/")) {
  resourcesBaseUrl = `${resourcesBaseUrl}/`;
}
config.resourcesBaseUrl = resourcesBaseUrl;


module.exports = Object.assign({}, config);