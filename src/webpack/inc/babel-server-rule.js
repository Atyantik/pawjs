module.exports = {
  test: /\.jsx?$/,
  use: {
    loader: "babel-loader",
    options: {
      presets: [
        [
          "@babel/env",
          {
            "targets": { "node": "8.9.4" }
          }
        ],
        "@babel/react"
      ],
      cacheDirectory: true,
      plugins: require("./babel-plugins")()
    }
  }
};
