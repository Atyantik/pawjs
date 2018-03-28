#! /usr/bin/env node
// eslint-disable-next-line
const fs = require("fs");
const path = require("path");
const parseArgs = require("minimist");
const _ = require("lodash");

const processDir = process.cwd();
// eslint-disable-next-line
let libRoot, projectRoot;

// Project root - Assuming the command is executed from project root
process.env.__project_root = process.env.__project_root || process.env.PROJECT_ROOT || (processDir + path.sep);
process.env.__project_root = projectRoot = path.isAbsolute(process.env.__project_root) ? process.env.__project_root: path.resolve(processDir, process.env.__project_root);

// PawJS library root, i.e. the folder where the script file is located
process.env.__lib_root = libRoot = __dirname;

// Arguments passed to the script
const args = parseArgs(process.argv.slice(2));
const allCommands = args["_"];

let userCommand = "start";

// If we are provided with set of commands then
if (allCommands.length) {
  userCommand = _.first(allCommands);
}

// Disable babel cache
process.env.BABEL_DISABLE_CACHE = 1;

const allExecutablePaths = require("./scripts/executable-paths");
const get_cmd = require("./scripts/find-command").factory(allExecutablePaths);

const cleanExit = function() { process.exit(); };
process.on("SIGINT", cleanExit); // catch ctrl-c
process.on("SIGTERM", cleanExit); // catch kill

switch(userCommand) {
  case "start:dev": {
    const
      spawn = require("child_process").spawn,
      childSpawn = spawn("node", [path.resolve(libRoot, "src/webpack/dev/start")]);

    childSpawn.stdout.pipe(process.stdout);
    childSpawn.stderr.pipe(process.stderr);
    break;
  }
  case "build:prod": {
    const spawn = require("child_process").spawn;

    const childSpawn = spawn(
      get_cmd("webpack"), [
        "--config",
        path.resolve(path.join(libRoot, "src", "webpack", "prod", "web.config.js")),

      ]
    );

    childSpawn.on("close", code => {
      if (!code) {
        const childSpawn2 = spawn(
          get_cmd("webpack"), [
            "--config",
            path.resolve(path.join(libRoot, "src", "webpack", "prod", "node-server.config.js")),

          ]
        );
        childSpawn2.stdout.pipe(process.stdout);
        childSpawn2.stderr.pipe(process.stderr);
      }
    });

    childSpawn.stdout.pipe(process.stdout);
    childSpawn.stderr.pipe(process.stderr);
    break;
  }
}