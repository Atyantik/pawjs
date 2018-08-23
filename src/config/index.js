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

// Calculate resource base url via options provided by config itself!
let resourcesBaseUrl = config.cdnUrl ? config.cdnUrl: config.appRootUrl;
if (!resourcesBaseUrl.endsWith("/")) {
  resourcesBaseUrl = `${resourcesBaseUrl}/`;
}
config.resourcesBaseUrl = resourcesBaseUrl;


// Give higher priority to env PORT than any other settings, until and unless changed by user
// in hook beforeStart!
if (
  typeof process.env.PORT === "string" &&
  process.env.PORT.length &&
  process.env.PORT.trim().length
) {
  config.port = process.env.PORT.trim();
}

// If not set hashedRoutes, and staticoutput is set, then set hashedRoutes to true
if (typeof config.hashedRoutes === "undefined" && config.singlePageApplication) {
  config.hashedRoutes = true;
}

export default Object.assign({}, config);