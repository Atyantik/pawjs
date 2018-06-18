const babelServer = require("./inc/babel-server-rule")({
  cacheDirectory: false
}).use.options;

require("@babel/register")({
  presets: babelServer.presets.default?babelServer.presets.default: babelServer.presets,
  plugins: babelServer.plugins,
  cache: false,
  ignore: [
    /node_modules\/(?!(weby|pawjs|imli|paw|webyjs|imlijs)).*/
  ]
});

const fs = require("fs");
const path = require("path");

const env = typeof process.env.NODE_ENV !== "undefined" ?
  process.env.NODE_ENV : "development";
const type = typeof process.env.WEBPACK_TARGET !== "undefined" ?
  process.env.WEBPACK_TARGET: "web";

let WebpackHandler = require("./handler");
WebpackHandler = WebpackHandler.default? WebpackHandler.default: WebpackHandler;

const handler = new WebpackHandler();

const processDir = process.cwd();
let project_root = process.env.__project_root || process.env.PROJECT_ROOT || (processDir + path.sep);
project_root = path.isAbsolute(project_root) ? project_root: path.resolve(processDir, project_root);

if (fs.existsSync(path.join(project_root, "webpack.js"))) {
  const ProjectWebpackPlugin = require(path.join(project_root, "webpack.js"));
  handler.addPlugin(new ProjectWebpackPlugin({addPlugin: handler.addPlugin}));
}

module.exports = handler.getConfig(env, type);
module.exports.handler = WebpackHandler;
