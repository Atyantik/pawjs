import Program from "commander";
import path from "path";
import ChildProcess from "child_process";
import {deleteFolderRecursive} from "./src/__tests__/__test_utils/util";
import allExecutablePaths from "./scripts/executable-paths";
import FindCommand from "./scripts/find-command";
import {
  getDataFromUrl,
  rmFilesInDir,
  saveDataToFile
} from "./scripts/cli-fucntions";

const spawn = ChildProcess.spawn;

const processDir = process.cwd();
let libRoot;

// Project root - Assuming the command is executed from project root
process.env.__project_root = process.env.__project_root || process.env.PROJECT_ROOT || (processDir + path.sep);
process.env.__project_root = path.isAbsolute(process.env.__project_root) ? process.env.__project_root: path.resolve(processDir, process.env.__project_root);

// PawJS library root, i.e. the folder where the script file is located
process.env.__lib_root = libRoot = __dirname;

// Disable babel cache for good. Compilation can be tricky
process.env.BABEL_DISABLE_CACHE = 1;


process.env.NODE_PATH = allExecutablePaths.join(path.delimiter);
process.env.PATH = allExecutablePaths.join(path.delimiter);

const get_cmd = FindCommand.factory(allExecutablePaths);
const webpackConfigPath = path.resolve(path.join(libRoot, "src", "webpack", "index.js"));

const cleanExit = function() { process.exit(); };
process.on("SIGINT", cleanExit); // catch ctrl-c
process.on("SIGTERM", cleanExit); // catch kill


export default class CliHandler {

  startDevServer = () => {
    require(path.resolve(libRoot, "src/server/dev.js"));
  };

  buildProd = () => {
    const config = require("./src/config/index");

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
        const serverSpawn = spawn(
          get_cmd("webpack"), [
            "--config",
            webpackConfigPath,
          ], {
            env: serverEnv,
            stdio: [process.stdin, process.stdout, "pipe"]
          }
        );

        serverSpawn.on("close", () => {
          if(!config.staticOutput) return;
          const directories = require("./src/webpack/utils/directories");
          const childServer = spawn(`node ${path.join(directories.dist, "server.js")}`, [], {shell: true, detached: true});
          childServer.stdout.on("data", (data) => {
            if(data.includes("Listening")) {
              Promise.all([
                getDataFromUrl(`http://${config.host}:${config.port}`),
                getDataFromUrl(`http://${config.host}:${config.port}/manifest.json`),
              ]).then(res => {
                const [data1, data2] = res;
                Promise.all([
                  saveDataToFile(data1, path.join(directories.build, "index.html")),
                  saveDataToFile(data2, path.join(directories.build, "manifest.json")),
                ]).then(() => {
                  rmFilesInDir(directories.dist);
                  //eslint-disable-next-line
                  console.log("\n\n=================================\nUse the build folder inside dist \nto deploy your current app.\n=================================");
                  process.kill(-childServer.pid, "SIGTERM");
                  process.kill(-childServer.pid, "SIGKILL");
                });
              });
            }
          });
          childServer.stderr.on("data", data => {
            //eslint-disable-next-line
            console.log(data.toString("utf8"));
            deleteFolderRecursive(directories.dist);
            //eslint-disable-next-line
            process.kill(-childServer.pid, "SIGTERM");
            process.kill(-childServer.pid, "SIGKILL");
          });
        });
      }
    });
  };

  test = () => {
    const env = Object.create(process.env);
    env.NODE_ENV = "test";
    spawn(get_cmd("jest"), [], {
      env,
      stdio: [process.stdin, process.stdout, "pipe"]
    });
  };

  constructor() {
    Program.version("0.0.1", "-v, --version")
      .command("start")
      .description("Start the development server")
      .action(this.startDevServer);

    Program
      .command("build")
      .description("Compile the project for production.")
      .action(this.buildProd);

    Program
      .command("test")
      .description("Run the test cases for the project.")
      .action(this.test);


    Program.on("option:verbose", () => {
      process.env.VERBOSE = this.verbose;
    });

    Program.on("command:*", () => {
      //eslint-disable-next-line
      console.error("Invalid command: %s\nSee --help for a list of available commands.", Program.args.join(" "));
      process.exit(1);
    });


    Program.parse(process.argv);
  }

}