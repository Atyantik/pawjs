module.exports = {
  test: /\.(sass|scss|css)$/,
  use: [
    {
      loader: "style-loader",
      options: {
        sourceMap: false,
      }
    },
    {
      loader: "css-loader",
      options: {
        modules: true,
        localIdentName: "[hash:base64]",
        sourceMap: false,
        minimize: true,
        importLoaders: 2
      }
    },
    {
      loader: "postcss-loader",
      options: {
        sourceMap: false,
        ident: "postcss",
        plugins: () => [
          require("postcss-cssnext")()
        ]
      }
    },
    {
      loader: "sass-loader",
      options: {
        outputStyle: "compressed",
        sourceMap: false,
        sourceMapContents: false,
      }
    }
  ],
};
