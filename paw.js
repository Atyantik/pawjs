#!/usr/bin/env node
const babelServer = require("./src/webpack/inc/babel-server-rule")({
  cacheDirectory: false
}).use.options;

require("@babel/register")({
  presets: babelServer.presets.default?babelServer.presets.default: babelServer.presets,
  plugins: babelServer.plugins,
  cache: false,
  ignore: [
    /node_modules\/(?!(@pawjs)).*/
  ]
});

const env = typeof process.env.NODE_ENV !== "undefined" ?
  process.env.NODE_ENV : "development";
const type = typeof process.env.WEBPACK_TARGET !== "undefined" ?
  process.env.WEBPACK_TARGET: "web";


let CliHandler = require("./cli");
CliHandler = CliHandler.default? CliHandler.default: CliHandler;

const handler = new CliHandler();

module.exports = () => handler.getConfig(env, type);
module.exports.handler = handler;