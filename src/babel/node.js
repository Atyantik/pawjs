/* global getDefault */
const presetEnv = getDefault(require('@babel/preset-env'));
const presetReact = getDefault(require('@babel/preset-react'));
const presetTypescript = getDefault(require('@babel/preset-typescript'));
const babelPlugins = getDefault(require('./plugin.js'));
const supportedExtensions = getDefault(require('../extensions.js'));

const rule = options => ({
  test: supportedExtensions.javascriptRegExp,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          presetEnv,
          {
            targets: { node: '10.15.3' },
          },
        ],
        presetReact,
        presetTypescript,
      ],
      cacheDirectory: typeof options.cacheDirectory !== 'undefined' ? options.cacheDirectory : process.env.PAW_CACHE === 'true',
      plugins: babelPlugins(options),
    },
  },
});

module.exports = rule;
