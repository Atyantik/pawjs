#! /usr/bin/env node
require("babel-register");
// Required Libraries
const parseArgs = require("minimist");
const _ = require("lodash");
const nodemon = require("nodemon");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const chokidar = require("chokidar");
const shell = require("shelljs");

const currentDir = process.cwd();
process.env.__p_root = currentDir + path.sep;
process.env.__c_root = __dirname;
const args = parseArgs(process.argv.slice(2));
const allCommands = args["_"];

let userCommand = "start";

if (allCommands.length) {
  userCommand = _.first(allCommands);
}

const NODE_ENV = process.env.NODE_ENV || "development";

// Set NODE_ENV if not already set
process.env.NODE_ENV = NODE_ENV;

// Disable babel cache
process.env.BABEL_DISABLE_CACHE = 1;

let allExecutablePaths = process.env.PATH.split(path.delimiter);
allExecutablePaths.unshift(__dirname);
allExecutablePaths.unshift(`${__dirname}${path.sep}.bin`);
allExecutablePaths.unshift(`${__dirname}${path.sep}node_modules${path.sep}.bin`);

function findCommandPath(com) {
  let execPath = "";
  _.each(allExecutablePaths, executablePath => {
    if (execPath.length) return;

    if (fs.existsSync(`${executablePath}${path.sep}${com}`)) {
      return execPath = `${executablePath}${path.sep}${com}`;
    }
    if (fs.existsSync(`${executablePath}${path.sep}${com}.exe`)) {
      return execPath = `${executablePath}${path.sep}${com}.exe`;
    }
    if (fs.existsSync(`${executablePath}${path.sep}${com}.cmd`)) {
      return execPath = `${executablePath}${path.sep}${com}.cmd`;
    }
  });
  return execPath.length ? execPath: undefined;
}


const lint = () => {
  return shell.exec(`${findCommandPath("eslint")} -c ${process.env.__p_root}.eslintrc --ignore-path ${process.env.__p_root}.gitignore ${process.env.__p_root}src`);
};
switch(userCommand) {
  case "start": {
    process.env.NODE_ENV = process.env.NODE_ENV || "development";
    nodemon({
      script: `${currentDir}${path.sep}src${path.sep}server.js`,
      execMap: {
        "js": findCommandPath("babel-node")
      },
      "watch": [
        `${currentDir}${path.sep}src${path.sep}server.js`
      ]
    });
    break;
  }
  case "build": {
    process.env.NODE_ENV = process.env.NODE_ENV || "production";
    const prodClientConfig = require(path.resolve(path.join(__dirname, "src", "webpack", "config", "prod.client.babel.js"))).default;
    // eslint-disable-next-line
    webpack(prodClientConfig, (clientErr, clientStats) => {

      if (!clientErr)  {
        const prodServerConfig = require(path.resolve(path.join(__dirname, "src", "webpack", "config", "prod.server.babel.js"))).default;
        // eslint-disable-next-line
        webpack(prodServerConfig, (serverErr, serverStats) => {
          if (serverErr) {
            // eslint-disable-next-line
						console.log(serverErr);
          }
        });
      } else {
        // eslint-disable-next-line
				console.log(clientErr);
      }
    });
    break;
  }
  case "lib:build": {
    const watcher = chokidar.watch("./lib", {
      persistent: true
    });
    // eslint-disable-next-line
    console.log(shell.exec("npm run build").stdout);
    watcher.on("change", () => {
      // eslint-disable-next-line
      console.log(shell.exec("npm run build").stdout);
    });
    break;
  }
  case "copy-babel-to-src": {
    shell.rm("-rf", `src${path.sep}babel`);
    shell.cp("-R", `lib${path.sep}babel`, "src");
    break;
  }
  case "lint": {
    const result = lint();
    return process.exit(result.code);
  }
  case "test": {
    const lintResults = lint();
    if (lintResults.code) {
      return process.exit(lintResults.code);
    }
    const testResults = shell.exec(`${findCommandPath("cross-env")} NODE_ENV=test ${findCommandPath("mocha")} --require babel-core/register "${process.env.__p_root}src/**/*.test.js"`);
    return process.exit(testResults.code);
  }
}
