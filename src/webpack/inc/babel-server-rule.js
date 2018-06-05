module.exports = module.exports.default = (options) => ({
  test: /\.jsx?$/,
  use: {
    loader: "babel-loader",
    options: {
      presets: [
        [
          "@babel/preset-env",
          {
            "targets": { "node": "8.11.2" }
          }
        ],
        "@babel/preset-react",
      ],
      cacheDirectory: options.cacheDirectory,
      plugins: require("./babel-plugins")(options)
    }
  }
});
