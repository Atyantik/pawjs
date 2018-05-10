module.exports = {
  test: /\.m?jsx?$/,
  use: [
    {
      loader: "babel-loader",
      options: {
        presets: [
          [
            require("@babel/preset-env"),
            {
              "targets": {
                "browsers": ["last 2 versions", "safari >= 7", "ie >= 9"]
              }
            }
          ],
          require("@babel/preset-react"),
        ],
        cacheDirectory: true,
        plugins: require("./babel-plugins")()
      }
    },
    {
      loader: "prefetch-loader",
    }
  ]
};