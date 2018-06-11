module.exports = module.exports.default = (options) => ({
  test: /\.jsx?$/,
  use: {
    loader: "babel-loader",
    options: {
      presets: [
        [
          require("@babel/preset-env"),
          {
            "targets": { "node": "8.11.2" }
          }
        ],
        require("@babel/preset-react"),
      ],
      cacheDirectory: options.cacheDirectory,
      plugins: require("./babel-plugins")(options)
    }
  }
});
