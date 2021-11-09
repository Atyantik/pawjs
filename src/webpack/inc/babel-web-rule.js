const lodash = require('lodash');
let babelPresetEnv = require('@babel/preset-env');

babelPresetEnv = babelPresetEnv.default ? babelPresetEnv.default : babelPresetEnv;

let babelPresetReact = require('@babel/preset-react');

babelPresetReact = babelPresetReact.default ? babelPresetReact.default : babelPresetReact;

let presetTypescript = require('@babel/preset-typescript');

presetTypescript = presetTypescript.default ? presetTypescript.default : presetTypescript;

let babelPlugins = require('../../babel/plugin');

babelPlugins = babelPlugins.default ? babelPlugins.default : babelPlugins;

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
                  browsers: ['last 2 versions', 'safari >= 7', 'ie >= 11'],
                },
              },
            ],
            [
              babelPresetReact,
              {
                runtime: 'automatic',
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
