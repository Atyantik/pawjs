const _ = require('lodash');
const directories = require('../utils/directories');

const defaultOptions = {
  outputPath: 'fonts/',
  name: '[hash].[ext]',
  context: directories.src,
};

const rule = options => ({
  test: /\.(eot|ttf|woff|woff2)$/,
  use: [
    {
      loader: 'file-loader',
      options: _.assignIn({}, defaultOptions, options),
    },
  ],
});

module.exports = rule;
