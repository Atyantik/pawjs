const { getDefault } = require('../globals');
const presetEnv = getDefault(require('@babel/preset-env'));
const presetReact = getDefault(require('@babel/preset-react'));
const presetTypescript = getDefault(require('@babel/preset-typescript'));
const babelPlugins = getDefault(require('./plugin.js'));
const supportedExtensions = getDefault(require('../extensions.js'));

const getCacheOption = (cacheDirectory) => (
  typeof cacheDirectory !== 'undefined'
    ? cacheDirectory
    : process.env.PAW_CACHE === 'true'
);

const rule = (options) => ({
  test: supportedExtensions.javascriptRegExp,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          presetEnv,
          {
            targets: { node: '12' },
          },
        ],
        presetReact,
        [
          presetTypescript,
          {
            allowDeclareFields: true
          },
        ]
      ],
      cacheDirectory: getCacheOption(options.cacheDirectory),
      plugins: babelPlugins(options),
      cache: getCacheOption(options.cacheDirectory),
    },
  },
});

module.exports = rule;
