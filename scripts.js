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

// Disable babel cache
process.env.BABEL_DISABLE_CACHE = 1;

let allExecutablePaths = process.env.PATH.split(path.delimiter);

// Add current folder to executable path
allExecutablePaths.unshift(__dirname);

// Include current folder bin and node_modules's bin
allExecutablePaths.unshift(path.join(__dirname, ".bin"));
allExecutablePaths.unshift(path.join(__dirname, "node_modules", ".bin"));

// Find command from all the paths possible
function findCommandPath(com) {
  let execPath = "";
  const possibleExtension = ["", ".exe", ".cmd"];
  _.each(allExecutablePaths, executablePath => {
    if (execPath.length) return;

    _.each(possibleExtension, ext => {
      if (execPath.length) return;

      const extendedPath = path.join(executablePath, `${com}${ext}`);
      if (fs.existsSync(extendedPath)) {
        execPath = extendedPath;
      }
    });
  });
  if (!execPath.length) throw new Error(`Cannot find command ${com}.`);
  return execPath;
}


const lint = () => {
  if (!path.resolve(`${process.env.__p_root}.eslintrc`)) {
    // eslint-disable-next-line
    console.log("Cannot find .eslintrc in root folder! Thus nothing to lint...");
    return { code: 0, stdout: "", };
  }
  return shell.exec(`${findCommandPath("eslint")} -c ${process.env.__p_root}.eslintrc --ignore-path ${process.env.__p_root}.gitignore ${process.env.__p_root}src`);
};

const test = () => {
  return shell.exec(`${findCommandPath("cross-env")} NODE_ENV=test ${findCommandPath("mocha")} --require babel-core/register "${process.env.__p_root}src/**/*.test.js"`);
};
switch(userCommand) {
  case "start": {
    process.env.NODE_ENV = process.env.NODE_ENV || "development";
    nodemon({
      script: path.join(currentDir, "src", "server.js"),
      execMap: {
        "js": findCommandPath("babel-node")
      },
      "watch": [
        path.join(currentDir, "src", "server.js"),
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
    // try lint and then complete the test
    const lintResults = lint();
    if (lintResults.code) {
      return process.exit(lintResults.code);
    }
    const testResults = test();
    return process.exit(testResults.code);
  }
  case "docker": {
    process.env.NODE_ENV = process.env.NODE_ENV || "development";
    if(!shell.which("docker")) {
      // eslint-disable-next-line
      console.log("command: 'docker' not found. Please install docker and try again. https://www.docker.com/");
      return process.exit(1);
    }

    // If .dockerignore does not exists in project root, then create it
    if (!fs.existsSync(path.join(process.env.__p_root, ".dockerignore"))) {
      // eslint-disable-next-line
      console.log("Creating .dockerignore file as id does not exists in project root");
      shell.cp("-R", path.join(process.env.__c_root, ".dockerignore"), process.env.__p_root);
    }

    let otherArgs = Array.from(process.argv).slice(3);

    const hasDockerFileInProjectRoot = fs.existsSync(path.join(process.env.__p_root, "Dockerfile"));

    if (
      !hasDockerFileInProjectRoot &&
      _.first(otherArgs) &&
      _.first(otherArgs).toLowerCase() === "build" &&
      _.indexOf(otherArgs, "-f") === -1 &&
      _.indexOf(otherArgs, "-F") === -1
    ) {
      // eslint-disable-next-line
      console.log("No docker file found in project root and no option for docker file specified!");

      const devDockerfilePath = path.join(process.env.__p_root, "docker", "Dockerfile");
      const prodDockerfilePath = path.join(process.env.__p_root, "docker", "prod", "Dockerfile");

      if (
        (process.env.NODE_ENV.toLowerCase() === "production" && !fs.existsSync(prodDockerfilePath)) ||
        (process.env.NODE_ENV.toLowerCase() === "development" && !fs.existsSync(devDockerfilePath))
      ) {
        // eslint-disable-next-line
        console.log("No Dockerfile found! Thus creating new in folder 'docker'");
        shell.cp("-R", path.join(process.env.__c_root, "src", "docker"), `${process.env.__p_root}`);
      }
      const dockerImagePath = process.env.NODE_ENV.toLowerCase() === "production"? prodDockerfilePath : devDockerfilePath;
      otherArgs = ["build", "-f", dockerImagePath, ...otherArgs.slice(1)];
    }
    // eslint-disable-next-line
    console.log(shell.exec(["docker", ...otherArgs].join(" ")).stdout);
    break;
  }
}
