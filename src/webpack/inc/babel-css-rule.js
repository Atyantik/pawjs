module.exports = {
  test: /\.(sass|scss|css)$/,
  use: [
    {
      loader: "style-loader",
      options: {
        sourceMap: true,
      }
    },
    {
      loader: "css-loader",
      options: {
        modules: true,
        localIdentName: "[path][name]__[local]",
        sourceMap: true,
        minimize: false,
        importLoaders: 2
      }
    },
    {
      loader: "postcss-loader",
      options: {
        sourceMap: true,
        ident: "postcss",
        plugins: () => [
          require("postcss-cssnext")()
        ]
      }
    },
    {
      loader: "sass-loader",
      options: {
        outputStyle: "expanded",
        sourceMap: true,
        sourceMapContents: true,
      }
    }
  ],
};
