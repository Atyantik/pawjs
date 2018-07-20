import path from "path";
import cssRule from "./inc/babel-css-rule";
import imageRule from "./inc/babel-image-rule";
import directories from "./utils/directories";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import pawConfig from "../config";
import resolverConfig from "./inc/webpack-resolver-config";
import webpack from "webpack";
import serverRule from "./inc/babel-server-rule";
import fontRule from "./inc/babel-font-rule";

const isProduction = process.env.PAW_ENV === "production";

export default {
  name: "server",
  mode: isProduction? "production": "development",
  target: "node",
  entry: path.resolve(process.env.__lib_root, "./src/server/server.js"),
  module: {
    rules: [
      serverRule({noChunk: true, cacheDirectory: process.env.PAW_CACHE === "true"}),
      ...cssRule(),
      fontRule({
        emitFile: false,
        outputPath: "build/fonts/",
        publicPath: `${pawConfig.resourcesBaseUrl}fonts/`
      }),
      imageRule({
        outputPath: "build/images/",
        publicPath: `${pawConfig.resourcesBaseUrl}images/`,
        name: "[hash].[ext]",
        context: directories.src,
      }),
    ]
  },
  context: directories.root,
  optimization: {
    splitChunks: false
  },
  output: {
    filename: "server.js",
    publicPath: pawConfig.resourcesBaseUrl,
    path: directories.dist,
    library: "dev-server",
    libraryTarget: "umd"
  },
  stats: true,
  externals: {
    "pwa-assets": "./assets.json",
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  ...resolverConfig,
  plugins: [
    new webpack.EnvironmentPlugin(Object.assign({}, process.env)),
    new MiniCssExtractPlugin({filename: "server.css"})
  ]
};