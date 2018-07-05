import Program from "commander";
import path from "path";
import ChildProcess from "child_process";
import allExecutablePaths from "./scripts/executable-paths";
import FindCommand from "./scripts/find-command";

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


          const deploySpawn = spawn(`node ${path.join(directories.dist, "server.js")}`, [], {shell: true, detached: true});
          deploySpawn.stdout.on("data", (data) => {
            if(data.includes("Listening")) {
              const http = require("http");
              const fs = require("fs");

              const getFile = (url, dir, fileName, type) => {
                return new Promise ((resolve, reject) => {
                  http.get(url, (res) => {
                    const {statusCode} = res;
                    let error;
                    if (statusCode !== 200) {
                      error = new Error("Request Failed.\n" +
                        `Status Code: ${statusCode}`);
                    }
                    if (error) {
                      //eslint-disable-next-line
                      console.error(error.message);
                      // consume response data to free up memory
                      res.resume();
                      return;
                    }

                    res.setEncoding("utf8");
                    let rawData = "";
                    res.on("data", (chunk) => {
                      rawData += chunk;
                    });
                    res.on("end", () => {
                      try {
                        fs.writeFileSync(path.join(dir, fileName), rawData, type);
                        resolve(res);
                      } catch (e) {
                        //eslint-disable-next-line
                        console.error(e.message);
                        reject(e.message);
                      }
                    });
                  }).on("error", (e) => {
                    //eslint-disable-next-line
                    console.error(`Got error: ${e.message}`);
                    reject(e.message);
                  });
                });
              };

              Promise.all([
                getFile(`http://${config.host}:${config.port}`, directories.build, "index.html", "utf-8"),
                getFile(`http://${config.host}:${config.port}/manifest.json`, directories.build, "manifest.json", "utf-8")
              ]).then(() => {
                const rmFilesInDir = (dirPath) => {
                  let files = [];
                  try {
                    files = fs.readdirSync(dirPath);
                  }
                  catch(e) {
                    return;
                  }
                  if (files.length > 0)
                    for (let i = 0; i < files.length; i++) {
                      const filePath = dirPath + "/" + files[i];
                      if (fs.statSync(filePath).isFile())
                        fs.unlinkSync(filePath);
                    }
                };
                rmFilesInDir(directories.dist);
                //eslint-disable-next-line
                console.log("\n\n=================================\nUse the build folder inside dist \nto deploy your current app.\n=================================");
                process.kill(-deploySpawn.pid, "SIGTERM");
                process.kill(-deploySpawn.pid, "SIGKILL");
              });

            }
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
      console.error("Invalid command: %s\nSee --help for a list of available commands.", Program.args.join(" "));
      process.exit(1);
    });


    Program.parse(process.argv);
  }

}