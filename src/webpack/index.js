const babelServer = require("./inc/babel-server-rule")({
  cacheDirectory: false
}).use.options;

require("@babel/register")({
  presets: babelServer.presets.default?babelServer.presets.default: babelServer.presets,
  plugins: babelServer.plugins,
  cache: false,
});

const env = typeof process.env.NODE_ENV !== "undefined" ?
  process.env.NODE_ENV : "development";
const type = typeof process.env.WEBPACK_TARGET !== "undefined" ?
  process.env.WEBPACK_TARGET: "web";

let WebpackHandler = require("./handler");
WebpackHandler = WebpackHandler.default? WebpackHandler.default: WebpackHandler;

const handler = new WebpackHandler();
module.exports = handler.getConfig(env, type);
module.exports.handler = WebpackHandler;
