#!/usr/bin/env node
let doCache = true;
for (let i in process.argv) {
  if (
    process.argv[i].toLowerCase().indexOf("-nc") !== false ||
    process.argv[i].toLowerCase().indexOf("--no-cache") !== false
  ) {
    doCache = false;
  }
}
const babelServer = require("./src/webpack/inc/babel-server-rule")({
  cacheDirectory: doCache
}).use.options;

require("@babel/register")({
  presets: babelServer.presets.default?babelServer.presets.default: babelServer.presets,
  plugins: babelServer.plugins,
  cache: doCache,
  ignore: [
    /node_modules\/(?!(@pawjs)).*/
  ]
});

let CliHandler = require("./scripts/cli");
CliHandler = CliHandler.default? CliHandler.default: CliHandler;

const handler = new CliHandler();
handler.run();