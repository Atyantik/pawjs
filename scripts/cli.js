import Program from "commander";
import path from "path";
import fs from "fs";
import ChildProcess from "child_process";
import executablePaths from "./executable-paths";
import FindCommand from "./find-command";
import packageDetails from "../package.json";

const spawn = ChildProcess.spawn;

const processDir = process.cwd();

const cleanExit = function() { process.exit(); };
process.on("SIGINT", cleanExit); // catch ctrl-c
process.on("SIGTERM", cleanExit); // catch kill


export default class CliHandler {
  
  program = Program;
  projectRoot = null;
  libRoot = null;
  searchCommand = null;
  pawConfigManualPath = false;
  projectRootManualPath = false;
  
  constructor() {
    // Initialize the env with defaults
    this.initProcessEnv();
    this.updateConfigPath = this.updateConfigPath.bind(this);
    this.updateProjectRoot = this.updateProjectRoot.bind(this);
    this.startServer = this.startServer.bind(this);
  }
  
  initProcessEnv() {
    
    // PawJS library root, i.e. the folder where the script file is located
    this.libRoot = process.env.__lib_root = path.resolve(path.join(__dirname, ".."));
    
    // Set paw cache to true by default
    process.env.PAW_CACHE = "true";
    
    process.env.PAW_VERBOSE = "false";
    
    // Set default env as development
    process.env.PAW_ENV = "development";
    
    // Project root - Assuming the command is executed from project root
    process.env.__project_root = (
      // If already stored then reuse the __project_root
      process.env.__project_root ||
      
      // if not try to get the project root from env variable PROJECT_ROOT
      process.env.PROJECT_ROOT ||
      
      // If not provided then consider the current directory of the process as project root
      (processDir + path.sep)
    );
    this.updateProjectRoot(process.env.__project_root, false);
    
    process.env.PAW_CONFIG_PATH = path.join(this.projectRoot, "pawconfig.json");
  }
  onSetProjectRoot() {
    
    const newNodePath = executablePaths(this.projectRoot, this.libRoot).join(path.delimiter);
    if (!process.env.NODE_PATH) {
      process.env.NODE_PATH = newNodePath;
    } else {
      process.env.NODE_PATH = [process.env.NODE_ENV, newNodePath].join(path.delimiter);
    }
    process.env.PATH = process.env.NODE_PATH;
    
    if (!this.pawConfigManualPath) {
      process.env.PAW_CONFIG_PATH = path.join(this.projectRoot, "pawconfig.json");
    }
    
    this.updateCommandSearch();
    
  }
  
  updateCommandSearch() {
    // get the search command with the executable path list
    this.searchCommand = FindCommand.factory(executablePaths(this.projectRoot, this.libRoot));
  }
  
  /**
   * Update config path for pawconfig.json
   * @param configPath
   * @param manual
   */
  updateConfigPath(configPath, manual = true) {
    // store the absolute value of project root
    let pawConfig = configPath;
    if (!path.isAbsolute(configPath)) {
      pawConfig = path.resolve(processDir, configPath);
    }
    let pathStats = fs.lstatSync(pawConfig);
    if(!pathStats.isFile()) {
      // eslint-disable-next-line
      console.warn(`WARNING:: Invalid config file path specified ${configPath}, using ${process.env.PAW_CONFIG_PATH} instead`);
      return;
    }
    if (manual) {
      this.pawConfigManualPath = true;
    }
    
    process.env.PAW_CONFIG_PATH = pawConfig;
    
  }
  
  /**
   * Specify the project root directory
   * @param projectRootDir
   * @param manual
   */
  updateProjectRoot(projectRootDir, manual = true) {
    // store the absolute value of project root
    let pRoot = projectRootDir;
    if (!path.isAbsolute(projectRootDir)) {
      pRoot = path.resolve(processDir, projectRootDir);
    }
    let pathStats = fs.lstatSync(pRoot);
    if(!pathStats.isDirectory()) {
      // eslint-disable-next-line
      console.warn(`WARNING:: Invalid root directory specified ${projectRootDir}, using ${this.projectRoot} instead`);
      return;
    }
    if (manual) {
      this.projectRootManualPath = true;
    }
    this.projectRoot = process.env.__project_root = pRoot;
    this.onSetProjectRoot();
  }
  
  /**
   * Start server depending on the env variable
   */
  startServer() {
    require(path.resolve(this.libRoot, "src/server/webpack-start.js"));
  }
  
  buildProd = () => {
    require(path.resolve(this.libRoot, "src/server/webpack-build.js"));
  };
  
  test() {
    const env = Object.create(process.env);
    env.NODE_ENV = "test";
    spawn(this.searchCommand("jest"), [], {
      env,
      stdio: [process.stdin, process.stdout, "pipe"]
    });
  }
  
  run() {
    this.program
      .version(packageDetails.version, "-V, --version");
    
    this.program.option("-v, --verbose", "Start with detailed comments and explanation");
    this.program.option("-e, --env <env>","Set the application environment default is dev env");
    this.program.option("-nc, --no-cache","Disable cache. Ideal for PawJS core/plugin development");
    this.program.option("-r, --root <projectRootDir>", "Set the project root");
    this.program.option("-c, --config <configPath>", "Set path to pawconfig.json");
    
    this.program
      .command("start")
      .description("Start the application")
      .action(this.startServer.bind(this));
    
    this.program
      .command("build")
      .description("Compile the project for production.")
      .action(this.buildProd.bind(this));
    
    this.program
      .command("test")
      .description("Run the test cases for the project.")
      .action(this.test.bind(this));
    
    
    // Set PAW_VERBOSE to true
    this.program.on("option:verbose", () => {
      process.env.PAW_VERBOSE = "true";
    });
    
    // Set Environment to
    this.program.on("option:env", env => {
      if (!env) return;
      env = env.toLowerCase();
      if (env === "dev") {
        // eslint-disable-next-line
        console.info("NOTE:: Setting env to development. Please use --env=development instead");
        env = "development";
      }
      
      if (env === "prod") {
        // eslint-disable-next-line
        console.info("NOTE:: Setting env to production. Please use --env=production instead");
        env = "production";
      }
      process.env.PAW_ENV = env;
      
      // Force set NODE_ENV & ENV to production
      if (process.env.PAW_ENV === "production" && typeof process.env.NODE_ENV === "undefined") {
        process.env.NODE_ENV = "production";
        process.env.ENV = "production";
      }
    });
    
    this.program.on("option:cache", () => {
      if (!this.program.cache) {
        // set PAW_CACHE to false
        process.env.PAW_CACHE = "false";
        
        // Disable babel cache if no-cache is specified
        process.env.BABEL_DISABLE_CACHE = true;
      }
      
    });
    
    // Update the project root based on the root option
    this.program.on("option:root", this.updateProjectRoot);
    
    // Update the pawconfig path
    this.program.on("option:config", this.updateConfigPath);
    
    this.program.on("command:*", () => {
      //eslint-disable-next-line
      console.error("Invalid command: %s\nSee --help for a list of available commands.", Program.args.join(" "));
      process.exit(1);
    });
    
    this.program.parse(process.argv);
    
    if (!process.argv.slice(2).length) {
      this.startServer();
    }
  }
}