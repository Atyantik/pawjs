const _ = require('lodash');
let babelPresetEnv = require('@babel/preset-env');

babelPresetEnv = babelPresetEnv.default ? babelPresetEnv.default : babelPresetEnv;

let babelPresetReact = require('@babel/preset-react');

babelPresetReact = babelPresetReact.default ? babelPresetReact.default : babelPresetReact;

let babelPlugins = require('./babel-plugins');

babelPlugins = babelPlugins.default ? babelPlugins.default : babelPlugins;

const defaultOptions = {
  cacheDirectory: process.env.PAW_CACHE === 'true',
};

const rule = (options = {}) => {
  const o = _.assignIn({}, defaultOptions, options);
  return {
    test: /\.m?jsx?$/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              babelPresetEnv,
              {
                targets: {
                  browsers: ['last 2 versions', 'safari >= 7', 'ie >= 9'],
                },
              },
            ],
            babelPresetReact,
          ],
          cacheDirectory: o.cacheDirectory,
          plugins: babelPlugins(o),
        },
      },
      // {
      //   loader: 'prefetch-loader',
      // },
    ],
  };
};
module.exports = rule;
