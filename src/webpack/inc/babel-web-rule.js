const fs = require('fs');
const path = require('path');
const _ = require('lodash');
let babelPresetEnv = require('@babel/preset-env');

babelPresetEnv = babelPresetEnv.default ? babelPresetEnv.default : babelPresetEnv;

let babelPresetReact = require('@babel/preset-react');

babelPresetReact = babelPresetReact.default ? babelPresetReact.default : babelPresetReact;

let directories = require('../utils/directories');

directories = directories.default ? directories.default : directories;

let babelPlugins = require('./babel-plugins');

babelPlugins = babelPlugins.default ? babelPlugins.default : babelPlugins;

const isProduction = process.env.PAW_ENV === 'production';
const defaultOptions = {
  cacheDirectory: process.env.PAW_CACHE === 'true',
  sourceMap: !isProduction,
};

const rule = (options = {}) => {
  const o = _.assignIn({}, defaultOptions, options);
  return [
    {
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
        {
          loader: 'prefetch-loader',
        },
      ],
    },
    {
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              sourceMap: o.sourceMap,
              jsx: 'React',
            },
            transpileOnly: true,
            configFile: (
              fs.existsSync(path.join(directories.root, 'tsconfig.json'))
                ? path.join(directories.root, 'tsconfig.json')
                : path.resolve(path.join(__dirname, '..', '..', '..', 'tsconfig.json'))
            ),
          },
        },
      ],
    },
  ];
};
module.exports = rule;
