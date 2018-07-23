let presetEnv = require("@babel/preset-env");
presetEnv = presetEnv.default ? presetEnv.default: presetEnv;

let presetReact = require("@babel/preset-react");
presetReact = presetReact.default ? presetReact.default: presetReact;

module.exports = module.exports.default = (options) => ({
  test: /\.jsx?$/,
  use: {
    loader: "babel-loader",
    options: {
      presets: [
        [
          presetEnv,
          {
            "targets": { "node": "8.11.2" }
          }
        ],
        presetReact,
      ],
      cacheDirectory: typeof options.cacheDirectory !== "undefined" ? options.cacheDirectory : process.env.PAW_CACHE === "true",
      plugins: require("./babel-plugins")(options)
    }
  }
});
