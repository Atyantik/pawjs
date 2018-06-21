import _ from "lodash";
import CleanWebpackPlugin from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { Tapable, SyncHook } from "tapable";
import webpack from "webpack";
import WorkboxPlugin from "workbox-webpack-plugin";

// non npm imports
import SwVariables from "./plugins/sw-variables";
import ExtractEmittedAssets from "./plugins/extract-emitted-assets";
import SyncedFilesPlugin from "./plugins/synced-files-plugin";
import directories from "./utils/directories";
import pawConfig from "./../config";
import serverRule from "./inc/babel-server-rule";
import webRule from "./inc/babel-web-rule";
import fontRule from "./inc/babel-font-rule";
import imageRule from "./inc/babel-image-rule";
import resolverConfig from "./inc/webpack-resolver-config";
import cssRule from "./inc/babel-css-rule";

let projectSW = "";
if (fs.existsSync(path.join(directories.src, "sw.js"))) {
  projectSW = fs.readFileSync(path.join(directories.src, "sw.js"), "utf-8");
}

let configEnvVars = {};
_.each(pawConfig, (value, key) => {
  configEnvVars[`__config_${key}`] = value;
});

let resourcesBaseUrl = pawConfig.cdnUrl ? pawConfig.cdnUrl: pawConfig.appRootUrl;
if (!resourcesBaseUrl.endsWith("/")) {
  resourcesBaseUrl = `${resourcesBaseUrl}/`;
}

export default class WebpackHandler extends Tapable {

  constructor(options) {
    super();
    this.hooks = {
      "init": new SyncHook(),
      "beforeConfig": new SyncHook(["env", "type", "config"])
    };
    this.options = options;
    this.addPlugin = this.addPlugin.bind(this);
    this.envConfigs = {
      "development": {
        web: [
          {
            name: "web",
            target: "web",
            mode: "development",
            devtool: "cheap-module-source-map",
            context: directories.root,
            entry: {
              client: [
                "@babel/polyfill",
                // Need react hot loader
                "react-hot-loader/patch",
                // Need webpack hot middleware
                "webpack-hot-middleware/client?name=web&path=/__hmr_update&timeout=2000&overlay=true&quiet=true",

                // Initial entry point for dev
                path.resolve(process.env.__lib_root, "./src/client/app.js"),
              ],
            },
            output: {
              path: path.join(directories.dist, "build"),
              publicPath: resourcesBaseUrl,
              filename: "js/[hash].js",
              chunkFilename: "js/[chunkhash].js"
            },
            module: {
              rules: [
                webRule(),
                ...cssRule(),
                fontRule(),
                imageRule(),
              ]
            },
            ...resolverConfig,
            optimization: {
              splitChunks: {
                chunks: "all"
              }
            },
            plugins: [
              new webpack.EnvironmentPlugin(Object.assign({}, {
                "__project_root": process.env.__project_root,
                "__lib_root": process.env.__lib_root,
              })),
              new webpack.HotModuleReplacementPlugin({
                multiStep: true,
              }),
              new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "css/[hash].css",
                chunkFilename: "css/[chunkhash].css"
              }),
              ...(pawConfig.serviceWorker? [
                new WorkboxPlugin.InjectManifest({
                  swSrc: path.resolve(process.env.__lib_root, "src","service-worker.js"),
                  swDest: "sw.js"
                }),
                new SwVariables({
                  fileName: "sw.js",
                  variables: Object.assign({workboxDebug: true}, pawConfig),
                  text: projectSW
                }),
              ] :[])

            ]
          }
        ],
        server: [
          {
            mode: "development",
            devtool: "cheap-module-source-map",
            target: "node",
            entry: path.resolve(process.env.__lib_root,"./src/server/common.js"),
            module: {
              rules: [
                serverRule({noChunk: true}),
                ...cssRule(),
                fontRule({emitFile: false, outputPath: "images/"}),
                imageRule({ emitFile: false, outputPath: "images/"}),
              ]
            },
            context: directories.root,
            devServer: {
              port: pawConfig.port,
              host: pawConfig.host,
              serverSideRender: pawConfig.serverSideRender,
              contentBase: path.join(directories.src, "public")
            },
            optimization: {
              splitChunks: false
            },
            output: {
              filename: "server.js",
              publicPath: resourcesBaseUrl,
              path: directories.dist,
              library: "dev-server",
              libraryTarget: "umd"
            },
            node: {
              __dirname: false,
              __filename: false,
            },

            externals: {
              express: "express",
            },
            ...resolverConfig,
            plugins: [
              new webpack.EnvironmentPlugin(Object.assign({}, {
                "__project_root": process.env.__project_root,
                "__lib_root": process.env.__lib_root,
              })),
              new MiniCssExtractPlugin({filename: "server.css"}),
            ]
          }
        ],
      },
      "production": {
        web: [
          {
            name: "web",
            target: "web",
            mode: "production",
            context: directories.root,
            entry: {
              client: [
                "@babel/polyfill",
                // Initial entry point for dev
                path.resolve(process.env.__lib_root, "./src/client/app.js"),
              ],
            },
            output: {
              path: path.join(directories.dist, "build"),
              publicPath: resourcesBaseUrl,
              filename: "js/[hash].js",
              chunkFilename: "js/[chunkhash].js"
            },
            stats: {
              warnings: false,
              colors: true,
            },
            module: {
              rules: [
                webRule({cacheDirectory: false}),
                ...cssRule({
                  sourceMap: false,
                  localIdentName: "[hash:base64:5]",
                  compress: true,
                }),
                fontRule({
                  outputPath: "fonts/",
                  publicPath: `${resourcesBaseUrl}fonts/`
                }),
                {
                  test: /\.(jpe?g|png|gif|svg|webp)$/i,
                  use: SyncedFilesPlugin.loader([
                    {
                      loader: "file-loader",
                      options: {
                        outputPath: "images/",
                        publicPath: `${resourcesBaseUrl}images/`,
                        name: "[hash].[ext]",
                        context: directories.src,
                      }
                    }
                  ])
                }
              ]
            },
            ...resolverConfig,
            optimization: {
              splitChunks: {
                chunks: "all"
              }
            },
            plugins: [
              new webpack.EnvironmentPlugin(Object.assign({}, {
                "__project_root": process.env.__project_root,
                "__lib_root": process.env.__lib_root,
              })),
              new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "css/[hash].css",
                chunkFilename: "css/[chunkhash].css"
              }),
              new CleanWebpackPlugin([
                directories.dist.split(path.sep).pop(),
              ], {
                root: path.dirname(directories.dist),
              }),

              ...(
                fs.existsSync(path.join(directories.src, "public")) ? [
                  new CopyWebpackPlugin([{
                    from: path.join(directories.src, "public"),
                    to: path.join(directories.dist, "build"),
                  }]),
                ] : []
              ),

              new ExtractEmittedAssets({
                outputPath: directories.dist
              }),
              // new SyncedFilesPlugin({
              //   outputPath: directories.dist
              // }),
              ...(pawConfig.serviceWorker? [
                new WorkboxPlugin.InjectManifest({
                  swSrc: path.resolve(process.env.__lib_root, "src","service-worker.js"),
                  swDest: "sw.js"
                }),
                new SwVariables({
                  fileName: "sw.js",
                  variables: Object.assign({workboxDebug: true}, pawConfig),
                  text: projectSW
                }),
              ] :[])
            ]
          }
        ],
        server: [
          {
            mode: "production",
            target: "node",
            entry: path.resolve(process.env.__lib_root, "./src/server/prod.js"),
            module: {
              rules: [
                serverRule({noChunk: true, cacheDirectory: false}),
                ...cssRule({
                  sourceMap: false,
                  localIdentName: "[hash:base64:5]",
                  compress: true,
                }),
                fontRule({
                  emitFile: false,
                  outputPath: "build/fonts/",
                  publicPath: `${resourcesBaseUrl}fonts/`
                }),
                {
                  test: /\.(jpe?g|png|gif|svg|webp)$/i,
                  use: SyncedFilesPlugin.loader([
                    {
                      loader: "file-loader",
                      options: {
                        outputPath: "build/images/",
                        publicPath: `${resourcesBaseUrl}images/`,
                        name: "[hash].[ext]",
                        context: directories.src,
                      }
                    }
                  ])
                },
              ]
            },
            context: directories.root,
            optimization: {
              splitChunks: false
            },
            output: {
              filename: "server.js",
              publicPath: resourcesBaseUrl,
              path: directories.dist,
              library: "dev-server",
              libraryTarget: "umd"
            },
            stats: {
              warnings: false,
              colors: true,
            },
            externals: {
              "pwa-assets": "./assets.json",
            },
            node: {
              __dirname: false,
              __filename: false,
            },
            ...resolverConfig,
            plugins: [
              new webpack.EnvironmentPlugin(Object.assign({}, {
                "__project_root": process.env.__project_root,
                "__lib_root": process.env.__lib_root,
              }, configEnvVars)),
              new MiniCssExtractPlugin({filename: "server.css"}),
              // new SyncedFilesPlugin({
              //   deleteAfterCompile: true,
              //   outputPath: directories.dist
              // })
            ]
          }
        ],
      },
    };

  }

  addPlugin(plugin) {
    try {
      if (plugin.hooks && Object.keys(plugin.hooks).length) {
        _.each(plugin.hooks, (hookValue, hookName) => {
          this.hooks[hookName] = hookValue;
        });
      }
    } catch(ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    plugin.apply && plugin.apply(this);
  }

  getConfig(env = "development", type = "web") {
    if (this.envConfigs[env] && this.envConfigs[env][type]) {
      this.hooks.beforeConfig.call(env, type, this.envConfigs[env][type], (err) => {
        if (err) {
          // eslint-disable-next-line
          console.log(err);
        }
      });
      return this.envConfigs[env][type];
    }
    if (env === "test") return {};
    throw new Error(`Cannot find appropriate config for environment ${env} & type ${type}`);
  }
}