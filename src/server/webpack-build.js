import path from "path";
import fs from "fs";
import request from "supertest";
import directories from "../webpack/utils/directories";
import pawConfig from "../config";
import express from "express";
import webpack from "webpack";
import webLog from "webpack-log";
import CleanWebpackPlugin from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

import env from "../config/index";
import wHandler from "../webpack";
import SyncedFilesPlugin from "../webpack/plugins/synced-files-plugin";
import ExtractEmittedAssets from "../webpack/plugins/extract-emitted-assets";

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
      
      wConfig.module.rules.forEach(rule => {
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
      if (!wConfig.externals) {
        wConfig.externals = {};
      }
      
      // Add paw-assets as externals
      if (!wConfig.externals["pwa-assets"]) {
        wConfig.externals["pwa-assets"] = "./assets.json";
      }
  
      wConfig.module.rules.forEach(rule => {
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
  const webCompiler = webpack(webConfig);
  webCompiler.hooks.done.tap("CompileServer", () => {
    // Create a webpack server compiler from the server config
    const serverCompiler = webpack(serverConfig);
    serverCompiler.hooks.done.tap("exportStatic", () => {
      const outputConfig = serverConfig[0].output;
      let server = require(path.resolve(outputConfig.path, outputConfig.filename));
      server = server.default ? server.default: server;
      if (pawConfig.staticOutput) {
        request(server).get("/").then(response => {
          fs.writeFileSync(path.join(directories.build, "index.html"), response.text, "utf-8");
        });
        request(server).get("/manifest.json").then(response => {
          fs.writeFileSync(path.join(directories.build, "manifest.json"), response.text, "utf-8");
        });
      }
    });
    serverCompiler.run();
  });
  webCompiler.run();
}catch (ex) {
  // eslint-disable-next-line
  console.log(ex);
}