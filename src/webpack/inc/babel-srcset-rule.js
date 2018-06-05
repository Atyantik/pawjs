const _ = require("lodash");

module.exports = module.exports.default = (options = {}) => ({
  test: /\.(jpe?g|png|svg|gif|webp)$/i,
  // match one of the loader's main parameters (sizes and placeholder)
  resourceQuery: /[?&](sizes|placeholder)(=|&|\[|$)/i,
  use: [
    {
      loader: "pwa-srcset-loader",
      options: _.assignIn({}, options)
    }
  ],
});