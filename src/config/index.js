const defaultConfig = require("../config/defaults.json");
const _ = require("lodash");

let config = {};
try {
  config = require(`${process.env.__project_root}/pawconfig.json`);

} catch (ex) {
  config = {};
}
config = _.defaultsDeep(config, defaultConfig);

module.exports = _.assignIn({}, config);
module.exports.env = (env = "") => {
  if (!env) {
    return _.assignIn({}, config);
  }
  return _.assignIn({}, _.get(config, env, {}));
};