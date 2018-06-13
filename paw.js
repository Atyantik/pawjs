#! /usr/bin/env node
const path = require("path");
const spawn = require("child_process").spawn;

const processDir = process.cwd();
let libRoot;

// Project root - Assuming the command is executed from project root
process.env.__project_root = process.env.__project_root || process.env.PROJECT_ROOT || (processDir + path.sep);
process.env.__project_root = path.isAbsolute(process.env.__project_root) ? process.env.__project_root: path.resolve(processDir, process.env.__project_root);

// PawJS library root, i.e. the folder where the script file is located
process.env.__lib_root = libRoot = __dirname;

// Disable babel cache for good. Compilation can be tricky
process.env.BABEL_DISABLE_CACHE = 1;

// Arguments passed to the script
const allArgs = (process.argv.slice(2));
let userCommand = "start";

let otherCommands = [];

// If we are provided with set of commands then
if (allArgs.length) {
  [userCommand, ...otherCommands] = allArgs;
}

const allExecutablePaths = require("./scripts/executable-paths");

process.env.NODE_PATH = allExecutablePaths.join(path.delimiter);
process.env.PATH = allExecutablePaths.join(path.delimiter);

const get_cmd = require("./scripts/find-command").factory(allExecutablePaths);
const webpackConfigPath = path.resolve(path.join(libRoot, "src", "webpack", "index.js"));

const cleanExit = function() { process.exit(); };
process.on("SIGINT", cleanExit); // catch ctrl-c
process.on("SIGTERM", cleanExit); // catch kill

switch(userCommand) {
  case "start:dev": {
    // Simply include the server/dev.js
    require(path.resolve(libRoot, "src/server/dev.js"));
    break;
  }
  case "build:prod": {

    const webEnv= Object.create(process.env);

    webEnv.NODE_ENV = "production";
    webEnv.WEBPACK_TARGET = "web";


    const childSpawn = spawn(
      get_cmd("webpack"), [
        "--config",
        webpackConfigPath,
      ], {
        env: webEnv,
        stdio: [process.stdin, process.stdout, "pipe"]
      }
    );

    childSpawn.on("close", code => {

      const serverEnv = Object.create(process.env);
      serverEnv.NODE_ENV = "production";
      serverEnv.WEBPACK_TARGET = "server";

      if (!code) {
        spawn(
          get_cmd("webpack"), [
            "--config",
            webpackConfigPath,
          ], {
            env: serverEnv,
            stdio: [process.stdin, process.stdout, "pipe"]
          }
        );
      }
    });
    break;
  }
  case "webpack": {
    // Disable babel cache
    process.env.BABEL_DISABLE_CACHE = 0;
    const env = Object.create(process.env);
    spawn(
      get_cmd("webpack"), [
        "--config",
        path.resolve(path.join(libRoot, "src", "webpack")),
        ...otherCommands
      ], {
        env: env,
        stdio: [process.stdin, process.stdout, "pipe"]
      }
    );
    break;
  }
  case "test": {
    const env = Object.create(process.env);
    env.NODE_ENV = "test";
    spawn(get_cmd("jest"), [
      ...otherCommands
    ], {
      env,
      stdio: [process.stdin, process.stdout, "pipe"]
    });
    break;
  }
}