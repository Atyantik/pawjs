const _ = require("lodash");

const defaultOptions = {
  cacheDirectory: process.env.PAW_CACHE === "true"
};
module.exports = module.exports.default = (options = {}) => {
  const o = _.assignIn({}, defaultOptions, options);
  return {
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
          cacheDirectory: o.cacheDirectory,
          plugins: require("./babel-plugins")(o)
        }
      },
      {
        loader: "prefetch-loader",
      }
    ]
  };
};