import path from "path";
import fs from "fs";
import os from "os";
import del from "del";
import mv from "mv";
import request from "supertest";
import directories from "../webpack/utils/directories";
import pawConfig from "../config";
import webpack from "webpack";
import CleanWebpackPlugin from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";


import wHandler from "../webpack";
import webRule from "../webpack/inc/babel-web-rule";
import serverRule from "../webpack/inc/babel-server-rule";
import SyncedFilesPlugin from "../webpack/plugins/synced-files-plugin";
import ExtractEmittedAssets from "../webpack/plugins/extract-emitted-assets";

const isVerbose = process.env.PAW_VERBOSE === "true";

const stats = {
  // fallback value for stats options when an option is not defined (has precedence over local webpack defaults)
  all: undefined,
  
  // Add asset Information
  assets: true,
  
  // Sort assets by a field
  // You can reverse the sort with `!field`.
  assetsSort: "field",
  
  // Add build date and time information
  builtAt: true,
  
  // Add information about cached (not built) modules
  cached: isVerbose,
  
  // Show cached assets (setting this to `false` only shows emitted files)
  cachedAssets: isVerbose,
  
  // Add children information
  children: true,
  
  // Add chunk information (setting this to `false` allows for a less verbose output)
  chunks: isVerbose,
  
  // Add namedChunkGroups information
  chunkGroups: isVerbose,
  
  // Add built modules information to chunk information
  chunkModules: isVerbose,
  
  // Add the origins of chunks and chunk merging info
  chunkOrigins: isVerbose,
  
  // Sort the chunks by a field
  // You can reverse the sort with `!field`. Default is `id`.
  chunksSort: "field",
  
  // Context directory for request shortening
  context: directories.src,
  
  // `webpack --colors` equivalent
  colors: true,
  
  // Display the distance from the entry point for each module
  depth: isVerbose,
  
  // Display the entry points with the corresponding bundles
  entrypoints: isVerbose,
  
  // Add --env information
  env: true,
  
  // Add errors
  errors: true,
  
  // Add details to errors (like resolving log)
  errorDetails: true,
  
  // Add the hash of the compilation
  hash: true,
  
  // Set the maximum number of modules to be shown
  maxModules: 0,
  
  // Add built modules information
  modules: isVerbose,
  
  // Sort the modules by a field
  // You can reverse the sort with `!field`. Default is `id`.
  modulesSort: "field",
  
  // Show dependencies and origin of warnings/errors (since webpack 2.5.0)
  moduleTrace: isVerbose,
  
  // Show performance hint when file size exceeds `performance.maxAssetSize`
  performance: true,
  
  // Show the exports of the modules
  providedExports: false,
  
  // Add public path information
  publicPath: true,
  
  // Add information about the reasons why modules are included
  reasons: isVerbose,
  
  // Add the source code of modules
  source: false,
  
  // Add timing information
  timings: true,
  
  // Show which exports of a module are used
  usedExports: false,
  
  // Add webpack version information
  version: isVerbose,
  
  // Add warnings
  warnings: true,
  profile: true,
  
  // Filter warnings to be shown (since webpack 2.4.0),
  // can be a String, Regexp, a function getting the warning and returning a boolean
  // or an Array of a combination of the above. First match wins.
  warningsFilter: (warning) => warning.indexOf("node_modules/express") !== -1
};

// Notify the user that compilation has started and should be done soon.

// eslint-disable-next-line
console.log(`
===================================================
  Building application...
  This may take time depending on the application size.
  Thank you for your patience.
===================================================
`);
const imageExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "webp",
];
const isImageRule = (rule) => {
  let isValid = true;
  imageExtensions.forEach(ext => {
    if (!isValid) return;
    isValid = rule.test.test(`.${ext}`);
  });
  return isValid;
};


const isBabelRule = (rule) => {
  if(
    rule &&
    rule.use &&
    Array.isArray(rule.use) &&
    rule.use.some(u => u.loader === "babel-loader")
  ) {
    return true;
  }
  
  return (
    rule &&
    rule.use &&
    typeof rule.use === "object" &&
    rule.use.loader === "babel-loader"
  );
};
const hasSyncedFileLoader = rule => {
  let hasSyncFile = false;
  if (!rule.use || !rule.use.length) {
    return hasSyncFile;
  }
  rule.use.forEach(u => {
    if (hasSyncFile) return;
    
    if (u.loader === path.resolve(__dirname, "../webpack/plugins/synced-files-plugin/loader.js")) {
      hasSyncFile = true;
    }
  });
  
  return hasSyncFile;
  
};

let cleanDistFolder = false;
let copyPublicFolder = !fs.existsSync(path.join(directories.src, "public"));
wHandler.hooks.beforeConfig.tap("AddSyncedFilesPlugin", (wEnv, wType, wConfigs) => {
  
  // Web specific configurations
  if (wType === "web") {
    
    wConfigs.forEach(wConfig => {
      if (!cleanDistFolder) {
        const hasCleanWebpackPlugin = wConfig.plugins.some(p => p instanceof CleanWebpackPlugin);
        
        if (!hasCleanWebpackPlugin) {
          wConfig.plugins.push(new CleanWebpackPlugin([
            directories.dist.split(path.sep).pop(),
          ], {
            root: path.dirname(directories.dist),
          }));
          cleanDistFolder = true;
        }
      }
      
      if (!copyPublicFolder) {
        wConfig.plugins.push(new CopyWebpackPlugin([{
          from: path.join(directories.src, "public"),
          to: directories.build,
        }]));
        copyPublicFolder = true;
      }
      
      wConfig.module.rules.forEach((rule,index) => {
        if(isBabelRule(rule)) {
          wConfig.module.rules[index] = webRule({hot: false});
        }
        
        
        if (isImageRule(rule) && !hasSyncedFileLoader(rule)) {
          rule.use = SyncedFilesPlugin.loader(rule.use);
        }
      });
      
      const hasSyncedFilePlugin = wConfig.plugins.some(p => p instanceof SyncedFilesPlugin);
      if (!hasSyncedFilePlugin) {
        wConfig.plugins.push(new SyncedFilesPlugin({
          outputPath: directories.dist
        }));
      }
      
      const hasExtractEmittedAssets = wConfig.plugins.some(p => p instanceof ExtractEmittedAssets);
      if (!hasExtractEmittedAssets) {
        wConfig.plugins.push(new ExtractEmittedAssets({
          outputPath: directories.dist
        }));
      }
      
    });
  }
  
  
  if (wType === "server") {
    wConfigs.forEach(wConfig => {
      
      if (wConfig.entry === path.resolve(process.env.__lib_root, "./src/server/server.js")) {
        wConfig.entry = path.resolve(process.env.__lib_root, "./src/server/build.js");
      }
      if (!wConfig.externals) {
        wConfig.externals = {};
      }
      
      // Add paw-assets as externals
      if (!wConfig.externals["pwa-assets"]) {
        wConfig.externals["pwa-assets"] = "./assets.json";
      }
  
      wConfig.module.rules.forEach((rule, index) => {
  
        if(isBabelRule(rule)) {
          wConfig.module.rules[index] = serverRule({
            noChunk: true,
            hot: false,
          });
        }
        
        if (isImageRule(rule) && !hasSyncedFileLoader(rule)) {
          rule.use = SyncedFilesPlugin.loader(rule.use);
        }
      });
  
      const hasSyncedFilePlugin = wConfig.plugins.some(p => p instanceof SyncedFilesPlugin);
      if (!hasSyncedFilePlugin) {
        wConfig.plugins.push(new SyncedFilesPlugin({
          outputPath: directories.dist
        }));
      }
    });
  }
});


try {
  
  // Server configurations
  const serverConfig = wHandler.getConfig(process.env.PAW_ENV, "server");
  
  // Web client configurations
  const webConfig = wHandler.getConfig(process.env.PAW_ENV, "web");
  
  // Create a webpack web compiler from the web configurations
  webpack(webConfig, (webErr, webStats) => {
    if (webErr || webStats.hasErrors()) {
      // Handle errors here
      // eslint-disable-next-line
      console.log("Web compiler error occurred. Please handle error here");
      return;
    }
    // eslint-disable-next-line
    console.log(webStats.toString(stats));
    webpack(serverConfig, (serverErr, serverStats) => {
      if (serverErr || serverStats.hasErrors()) {
        // Handle errors here
        // eslint-disable-next-line
        console.log("Server Compiler error occurred. Please handle error here");
        return;
      }
  
      // eslint-disable-next-line
      console.log(serverStats.toString(stats));
      
      if (pawConfig.singlePageApplication) {
        
        // eslint-disable-next-line
        console.log("Creating static files...");
        
        const outputConfig = serverConfig[0].output;
        let server = require(path.resolve(outputConfig.path, outputConfig.filename));
        server = server.default ? server.default: server;
        
        // eslint-disable-next-line
        console.log("Generating index.html & manifest.json");
        
        Promise.all([
          request(server).get("/"),
          request(server).get("/manifest.json")
        ]).then(([indexResponse, manifestResponse]) => {
          
          fs.writeFileSync(path.join(directories.build, "index.html"), indexResponse.text, "utf-8");
          fs.writeFileSync(path.join(directories.build, "manifest.json"), manifestResponse.text, "utf-8");
          
          // eslint-disable-next-line
          console.log(`Successfully created: ${path.join(directories.build, "index.html")}`);
          // eslint-disable-next-line
          console.log(`Successfully created: ${path.join(directories.build, "manifest.json")}`);
        }).then(() => {
          
          // eslint-disable-next-line
          console.log("\n\nRe-organizing files...\n");
          try {
            const tempPawJSBuildPath = path.join(os.tmpdir(), "pawjs-build");
            // Move to tempFolder
            del([tempPawJSBuildPath]).then(() => {
              
              mv(directories.build, tempPawJSBuildPath, {mkdir: true, clobber: true}, (err) => {
                if (err) {
                  // eslint-disable-next-line
                  console.error(err);
                  return;
                }
                
                del([`${directories.dist}/**/*`])
                  .then(() => {
      
                    mv(tempPawJSBuildPath, directories.dist, {clobber: true}, (err) => {
                      if (err) {
                        // eslint-disable-next-line
                        console.error(err);
                        return;
                      }
  
                      // eslint-disable-next-line
                      console.log("Static site generated successfully.");
                    });
                  });
              });
            });
            
          } catch (ex) {
            
            // eslint-disable-next-line
            console.log(ex);
          }
        });
      }
    });
  });
}catch (ex) {
  // eslint-disable-next-line
  console.log(ex);
}