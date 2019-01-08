const fs = require('fs');
const path = require('path');

let presetEnv = require('@babel/preset-env');

presetEnv = presetEnv.default ? presetEnv.default : presetEnv;

let presetReact = require('@babel/preset-react');

presetReact = presetReact.default ? presetReact.default : presetReact;

let directories = require('../utils/directories');

directories = directories.default ? directories.default : directories;

let babelPlugins = require('./babel-plugins');

babelPlugins = babelPlugins.default ? babelPlugins.default : babelPlugins;

const rule = options => ([
  {
    test: /\.jsx?$/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          [
            presetEnv,
            {
              targets: { node: '8.11.2' },
            },
          ],
          presetReact,
        ],
        cacheDirectory: typeof options.cacheDirectory !== 'undefined' ? options.cacheDirectory : process.env.PAW_CACHE === 'true',
        plugins: babelPlugins(options),
      },
    },
  },
  {
    test: /\.tsx?$/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            sourceMap: Boolean(options.sourceMap),
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
]);

module.exports = rule;
