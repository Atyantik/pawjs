module.exports = {
  test: /\.m?jsx?$/,
  use: {
    loader: "babel-loader",
    options: {
      presets: [
        [
          "@babel/env",
          {
            "targets": {
              "browsers": ["last 2 versions", "safari >= 7", "ie >= 9"]
            }
          }
        ],
        "@babel/react"
      ],
      cacheDirectory: true,
      plugins: require("./babel-plugins")()
    }
  }
};
