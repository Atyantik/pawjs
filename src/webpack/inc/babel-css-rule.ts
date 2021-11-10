import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Sass from 'sass';
import autoprefixer from 'autoprefixer';
import assignIn from 'lodash/assignIn';
import directories from '../utils/directories';

const isProduction = process.env.PAW_ENV === 'production';

const root = process.cwd();

const localIdentName = isProduction
    ? '[contenthash:base64:5]'
    : '[name]__[local]--[hash:base64:5]';

const defaultOptions = {
  localIdentName,
  sourceMap: !isProduction,
  compress: isProduction,
  hot: false,
};

export default (options: any = {}) => {
  const o = assignIn({}, defaultOptions, options);
  return [
    {
      test: /\.(css|s[ac]ss)$/i,
      exclude: [
        path.join(directories.src, 'resources'),
        path.join(directories.root, 'node_modules'),
      ],
      use: [
        // Translates CSS into CommonJS
        {
          loader: o.hot ? 'style-loader' : MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName,
              mode: (resourcePath: string) => {
                if (/pure\.(css|s[ac]ss)$/i.test(resourcePath)) {
                  return 'pure';
                }
                if (/global\.(css|s[ac]ss)$/i.test(resourcePath)) {
                  return 'global';
                }
                return 'local';
              },
              localIdentContext: path.resolve(root, 'src'),
              // exportLocalsConvention: 'camelCase',
              // namedExport: true,
            },
            importLoaders: 2,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              ident: 'postcss',
              plugins: [
                [
                  autoprefixer,
                ],
              ],
            },
          },
        },
        // Compiles Sass to CSS
        {
          loader: 'sass-loader',
          options: {
            // Prefer `dart-sass`
            implementation: Sass,
            sassOptions: {
              fiber: false,
            },
          },
        },
      ],
    },
    {
      test: /\.(css|s[ac]ss)$/i,
      include: [
        path.join(directories.src, 'resources'),
        path.join(directories.root, 'node_modules'),
      ],
      use: [
        // Translates CSS into CommonJS
        {
          loader: o.hot ? 'style-loader' : MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[local]',
              localIdentContext: path.resolve(root, 'src'),
              // exportLocalsConvention: 'camelCase',
              // namedExport: true,
            },
            importLoaders: 2,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              ident: 'postcss',
              plugins: [
                [
                  autoprefixer,
                ],
              ],
            },
          },
        },
        // Compiles Sass to CSS
        {
          loader: 'sass-loader',
          options: {
            // Prefer `dart-sass`
            implementation: Sass,
            sassOptions: {
              fiber: false,
            },
          },
        },
      ],
    },
  ];
};
