import Program from 'commander';
import path from 'path';
import fs from 'fs';
import ChildProcess from 'child_process';
import dotenv from 'dotenv';
import executablePaths from './executable-paths';
import FindCommand from './find-command';
import packageDetails from '../package.json';

const { spawn } = ChildProcess;

const processDir = process.cwd();

const cleanExit = function cleanExit() { process.exit(); };
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill


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
    // try to get ENV_CONFIG_PATH from environment
    process.env.ENV_CONFIG_PATH = process.env.ENV_CONFIG_PATH || path.resolve(processDir, '.env');
    if (!path.isAbsolute(process.env.ENV_CONFIG_PATH)) {
      process.env.ENV_CONFIG_PATH = path.resolve(processDir, process.env.ENV_CONFIG_PATH);
    }
    if (!fs.existsSync(process.env.ENV_CONFIG_PATH)) {
      process.env.ENV_CONFIG_PATH = null;
      delete process.env.ENV_CONFIG_PATH;
    }
    if (process.env.ENV_CONFIG_PATH) {
      this.processEnvConfigPath();
    }

    // PawJS library root, i.e. the folder where the script file is located
    process.env.LIB_ROOT = path.resolve(path.join(__dirname, '..'));
    this.libRoot = process.env.LIB_ROOT;

    // Set paw cache to true by default
    process.env.PAW_CACHE = 'true';

    process.env.PAW_VERBOSE = 'false';

    // Set default env as development
    process.env.PAW_ENV = 'development';

    // Project root - Assuming the command is executed from project root
    process.env.PROJECT_ROOT = (
      // If already stored then reuse the PROJECT_ROOT
      process.env.PROJECT_ROOT

      // if not try to get the project root from env variable PROJECT_ROOT
      || process.env.PROJECT_ROOT

      // If not provided then consider the current directory of the process as project root
      || (processDir + path.sep)
    );
    this.updateProjectRoot(process.env.PROJECT_ROOT, false);

    process.env.PAW_CONFIG_PATH = path.join(this.projectRoot, 'pawconfig.json');
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
      process.env.PAW_CONFIG_PATH = path.join(this.projectRoot, 'pawconfig.json');
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
    const pathStats = fs.lstatSync(pawConfig);
    if (!pathStats.isFile()) {
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
   * Process env from .env file specified
   */
  processEnvConfigPath() {
    const envConfig = dotenv.parse(fs.readFileSync(process.env.ENV_CONFIG_PATH));
    Object.keys(envConfig).forEach((e) => {
      process.env[e] = envConfig[e];
      if (e === 'PROJECT_ROOT') {
        this.updateProjectRoot(envConfig[e], true);
      }
    });
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
    const pathStats = fs.lstatSync(pRoot);
    if (!pathStats.isDirectory()) {
      // eslint-disable-next-line
      console.warn(`WARNING:: Invalid root directory specified ${projectRootDir}, using ${this.projectRoot} instead`);
      return;
    }
    if (manual) {
      this.projectRootManualPath = true;
    }
    process.env.PROJECT_ROOT = pRoot;
    this.projectRoot = process.env.PROJECT_ROOT;
    this.onSetProjectRoot();
  }

  /**
   * Start server depending on the env variable
   */
  startServer() {
    process.env.PAW_HOT = typeof process.env.PAW_HOT !== 'undefined' ? process.env.PAW_HOT : 'true';
    // eslint-disable-next-line
    require(path.resolve(this.libRoot, 'src/server/webpack-start.js'));
  }

  buildProd = () => {
    process.env.PAW_HOT = typeof process.env.PAW_HOT !== 'undefined' ? process.env.PAW_HOT : 'false';
    // eslint-disable-next-line
    require(path.resolve(this.libRoot, 'src/server/webpack-build.js'));
  };

  lint() {
    const env = Object.create(process.env);
    env.NODE_ENV = 'test';

    let eslintPath = path.join(this.libRoot, '.eslintrc');
    let eslintRoot = this.libRoot;
    if (fs.existsSync(path.join(this.projectRoot, '.eslintrc'))) {
      eslintPath = path.join(this.projectRoot, '.eslintrc');
      eslintRoot = this.projectRoot;
    }

    const srcDir = fs.existsSync(path.join(eslintRoot, 'src')) ? path.join(eslintRoot, 'src') : eslintRoot;
    // eslint-disable-next-line
    console.log(`Linting with eslint...\nConfig path: ${eslintPath}`);
    const eslint = spawn(this.searchCommand('eslint'), [
      '-c',
      eslintPath,
      srcDir,
    ], {
      shell: true,
      env,
      stdio: [process.stdin, process.stdout, 'pipe'],
    });

    eslint.on('close', (errorCode) => {
      if (!errorCode) {
        let tslintPath = path.join(this.libRoot, 'tslint.json');
        let tslintRoot = this.libRoot;
        if (fs.existsSync(path.join(this.projectRoot, 'tslint.json'))) {
          tslintPath = path.join(this.projectRoot, 'tslint.json');
          tslintRoot = this.projectRoot;
        }
        const tsSrcDir = fs.existsSync(path.join(tslintRoot, 'src')) ? path.join(tslintRoot, 'src') : tslintRoot;
        // eslint-disable-next-line
        console.log(`Linting with tslint...\nConfig path: ${tslintPath}`);
        spawn(this.searchCommand('tslint'), [
          '-c',
          tslintPath,
          `${tsSrcDir}/**/*.ts{,x}`,
        ], {
          shell: true,
          env,
          stdio: [process.stdin, process.stdout, 'pipe'],
        });
      }
    });
  }

  test() {
    const env = Object.create(process.env);
    env.NODE_ENV = 'test';

    let tscRoot = this.libRoot;
    if (fs.existsSync(path.join(this.projectRoot, 'tsconfig.json'))) {
      tscRoot = this.projectRoot;
    }
    const tsc = spawn(this.searchCommand('tsc'), ['-p', tscRoot], {
      shell: true,
      env,
      stdio: [process.stdin, process.stdout, 'pipe'],
    });

    tsc.on('close', (errorCode) => {
      if (!errorCode) {
        spawn(this.searchCommand('jest'), ['--verbose'], {
          shell: true,
          env,
          stdio: [process.stdin, process.stdout, 'pipe'],
        });
      }
    });
  }

  run() {
    this.program
      .version(packageDetails.version, '-V, --version');
    this.program.option('--env-config-path <envConfigPath>', 'Set path to environment file handled via DotEnv');
    this.program.option('-v, --verbose', 'Start with detailed comments and explanation');
    this.program.option('-e, --env <env>', 'Set the application environment default is dev env');
    this.program.option('-nc, --no-cache', 'Disable cache. Ideal for PawJS core/plugin development');
    this.program.option('-r, --root <projectRootDir>', 'Set the project root');
    this.program.option('-c, --config <configPath>', 'Set path to pawconfig.json');

    this.program
      .command('start')
      .description('Start the application')
      .action(this.startServer.bind(this));

    this.program
      .command('build')
      .description('Compile the project for production.')
      .action(this.buildProd.bind(this));

    this.program
      .command('test')
      .description('Run the test cases for the project.')
      .action(this.test.bind(this));

    this.program
      .command('lint')
      .description('Run eslint & tslint for the project.')
      .action(this.lint.bind(this));

    // Set PAW_VERBOSE to true
    this.program.on('option:env-config-path', (envConfigPath) => {
      let ecp = envConfigPath;
      if (!path.isAbsolute(ecp)) {
        ecp = path.resolve(processDir, ecp);
      }
      if (fs.existsSync(ecp) && ecp !== path.resolve(processDir, '.env')) {
        process.env.ENV_CONFIG_PATH = ecp;
        this.processEnvConfigPath();
      }
    });

    // Set PAW_VERBOSE to true
    this.program.on('option:verbose', () => {
      process.env.PAW_VERBOSE = 'true';
    });

    // Set Environment to
    this.program.on('option:env', (e) => {
      let env = e;
      if (!env) return;
      env = env.toLowerCase();
      if (env === 'dev') {
        // eslint-disable-next-line
        console.info("NOTE:: Setting env to development. Please use --env=development instead");
        env = 'development';
      }

      if (env === 'prod') {
        // eslint-disable-next-line
        console.info("NOTE:: Setting env to production. Please use --env=production instead");
        env = 'production';
      }
      process.env.PAW_ENV = env;

      // Force set NODE_ENV & ENV to production
      if (process.env.PAW_ENV === 'production' && typeof process.env.NODE_ENV === 'undefined') {
        process.env.NODE_ENV = 'production';
        process.env.ENV = 'production';
      }
    });

    this.program.on('option:cache', () => {
      if (!this.program.cache) {
        // set PAW_CACHE to false
        process.env.PAW_CACHE = 'false';

        // Disable babel cache if no-cache is specified
        process.env.BABEL_DISABLE_CACHE = true;
      }
    });

    // Update the project root based on the root option
    this.program.on('option:root', this.updateProjectRoot);

    // Update the pawconfig path
    this.program.on('option:config', this.updateConfigPath);

    this.program.on('command:*', () => {
      // eslint-disable-next-line
      console.error("Invalid command: %s\nSee --help for a list of available commands.", Program.args.join(" "));
      process.exit(1);
    });

    this.program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      this.startServer();
    }
  }
}
