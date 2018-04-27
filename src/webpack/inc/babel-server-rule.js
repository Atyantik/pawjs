module.exports = {
  test: /\.jsx?$/,
  use: {
    loader: "babel-loader",
    options: {
      presets: [
        [
          require("@babel/preset-env"),
          {
            "targets": { "node": "8.9.4" }
          }
        ],
        require("@babel/preset-react"),
      ],
      cacheDirectory: true,
      plugins: require("./babel-plugins")()
    }
  }
};
