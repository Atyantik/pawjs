const lodash = require('lodash');
const { getDefault } = require('../../globals');
const babelPresetEnv = getDefault(require('@babel/preset-env'));
const babelPresetReact = getDefault(require('@babel/preset-react'));
const presetTypescript = getDefault(require('@babel/preset-typescript'));
const babelPlugins = getDefault(require('../../babel/plugin'));

const defaultOptions = {
  cacheDirectory: process.env.PAW_CACHE === 'true',
};

const rule = (options = {}) => {
  const o = lodash.assignIn({}, defaultOptions, options);
  return {
    test: /\.(j|t)sx?$/,
    exclude: [
      /node_modules\/(?!(@pawjs|pawjs-)).*/,
    ],
    use: [
      {
        loader: 'babel-loader',
        options: {
          sourceType: 'unambiguous',
          compact: false,
          retainLines: true,
          presets: [
            [
              babelPresetEnv,
              {
                useBuiltIns: 'entry',
                corejs: '3.6',
                targets: {
                  // Target all browsers that are not dead
                  browsers: ['defaults', 'not dead'],
                },
              },
            ],
            [
              babelPresetReact,
              {
                runtime: 'automatic',
                useBuiltIns: true,
                development: process?.env?.PAW_ENV === 'development',
              },
            ],
            presetTypescript,
          ],
          cacheDirectory: o.cacheDirectory,
          plugins: babelPlugins(o),
        },
      },
      {
        loader: 'prefetch-loader',
      },
    ],
  };
};
module.exports = rule;
