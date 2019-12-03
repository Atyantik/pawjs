import ChildProcess from 'child_process';
import Program from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import executablePaths from './executable-paths';
import packageDetails from '../../package.json';
import { factory as findCommandFactory } from './find-command';

const { spawn } = ChildProcess;

/**
 * Current process directory
 */
const processDir: string = process.cwd();
let pawConfigWarningDisplayed = false;
const renderPawConfigWarning = () => {
  if (!pawConfigWarningDisplayed) {
    // eslint-disable-next-line no-console
    console.warn('==> pawconfig.json has been depreciated and would'
      + ' be removed in upcoming release Please use .env files instead. '
      + 'Refer to https://www.reactpwa.com/blog/using-dot-env/');
  }
  pawConfigWarningDisplayed = true;
};

/**
 * We need the program to exit clean even if the
 * user triggered ctrl+c or via any other interrupt.
 */
const cleanExit = (): void => process.exit();
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

export default class CliHandler {
  /**
   * Set program as instance of commander
   */
  program: Program.CommanderStatic = Program;

  /**
   * Project root is the path of directory where the
   * project source code resides
   */
  projectRoot: string = '';

  /**
   * Library root is the path of directory where PawJS is installed
   */
  libRoot: string = '';

  /**
   * As there is a very good possibility that many versions of same packages
   * are installed via npm, searchCommand helps search for the path of executable
   */
  searchCommand: ((cmd: string) => string) | undefined;

  /**
   * A flag to check if the pawConfig was set manually
   * via the CLI or ENV
   */
  pawConfigManualPath: boolean = false;

  constructor() {
    // Bind to local class
    this.updateConfigPath = this.updateConfigPath.bind(this);
    this.updateProjectRoot = this.updateProjectRoot.bind(this);
    this.startServer = this.startServer.bind(this);
    this.buildProd = this.buildProd.bind(this);
    this.test = this.test.bind(this);
    this.lint = this.lint.bind(this);

    // Initialize the env with defaults
    this.initProcessEnv();
  }

  /**
   * Initialize default environment variables
   */
  initProcessEnv() {
    // try to get ENV_CONFIG_PATH from environment
    /**
     * If the env variable ENV_CONFIG_PATH is set then resolve the path
     * and load the env config.
     * The below process is of importance when parameters passed via env
     * like `ENV_CONFIG_PATH=./local.env` pawjs start
     */
    if (process.env.ENV_CONFIG_PATH && !this.setEnvConfigPath(process.env.ENV_CONFIG_PATH)) {
      // Here we know that ENV_CONFIG_PATH as set but was not a valid one,
      // so we delete it from variable list instead
      delete process.env.ENV_CONFIG_PATH;
    }

    // if ENV_CONFIG_PATH is not set, then we simply need to assign it the value of '.env'
    if (!process.env.ENV_CONFIG_PATH) {
      // if .env file does not exists, the the value won't be set anyway
      this.setEnvConfigPath(path.resolve(processDir, '.env'));
    }

    // PawJS library root, i.e. the folder where the script file is located
    // Point to note here is we do not care if user specified LIB_ROOT in .env
    // We calculate it on basis of this file being executed!
    process.env.LIB_ROOT = path.resolve(path.join(__dirname, '..', '..'));
    this.libRoot = process.env.LIB_ROOT;

    // Set PawJS cache to true by default
    process.env.PAW_CACHE = 'true';

    /**
     * Setting verbose mode to false by default,
     * enabling verbose mode gives extra details of compilation to user on terminal
     * which might not be necessary always.
     */
    process.env.PAW_VERBOSE = 'false';

    // Set default env as development
    process.env.PAW_ENV = 'development';

    /**
     * We try to find the project root at the start of the program,
     * the project root we define here serves as the default project root,
     * it might be updated via cli options
     */
    // Project root - Assuming the command is executed from project root
    process.env.PROJECT_ROOT = (
      /**
       * If already stored then reuse the PROJECT_ROOT from env variable, at this moment
       * the PROJECT_ROOT can also be defined in file located at ENV_CONFIG_PATH
       * or via direct env declaration like `PROJECT_ROOT=./demo pawjs start`
       */
      process.env.PROJECT_ROOT

      // If not provided then consider the current directory of the process as project root
      || (processDir + path.sep)
    );
    /**
     * Update the project root, now this is a separate function as
     * updating project root updates lots of ENV PATH, thus we have a different function
     * for updating Project Root
     */
    this.updateProjectRoot(process.env.PROJECT_ROOT);
    /**
     * We expect the pawconfig.json to be in the project root folder only
     */
    process.env.PAW_CONFIG_PATH = path.join(this.projectRoot, 'pawconfig.json');
  }

  /**
   * Create list of executable paths for our user based on
   * project root and library root
   */
  updateExecutablePaths() {
    const newNodePath = executablePaths(this.projectRoot, this.libRoot).join(path.delimiter);
    if (!process.env.NODE_PATH) {
      process.env.NODE_PATH = newNodePath;
    } else {
      process.env.NODE_PATH = [process.env.NODE_PATH, newNodePath].join(path.delimiter);
    }
    process.env.PATH = process.env.NODE_PATH;

    if (!this.pawConfigManualPath) {
      process.env.PAW_CONFIG_PATH = path.join(this.projectRoot, 'pawconfig.json');
      if (fs.existsSync(path.resolve(process.env.PAW_CONFIG_PATH))) {
        renderPawConfigWarning();
      }
    }
  }

  updateCommandSearch() {
    // get the search command with the executable path list
    this.searchCommand = findCommandFactory(executablePaths(this.projectRoot, this.libRoot));
  }

  /**
   * Update config path for pawconfig.json
   * @param configPath
   * @param manual
   */
  updateConfigPath(configPath: string, manual = true) {
    renderPawConfigWarning();
    // store the absolute value of project root
    let pawConfig = configPath;
    if (!path.isAbsolute(configPath)) {
      pawConfig = path.resolve(processDir, configPath);
    }
    const pathStats = fs.lstatSync(pawConfig);
    if (!pathStats.isFile()) {
      // eslint-disable-next-line
      console.warn(
        `WARNING:: Invalid config file path specified ${configPath},
        using ${process.env.PAW_CONFIG_PATH} instead`,
      );
      return;
    }
    if (manual) {
      this.pawConfigManualPath = true;
    }

    process.env.PAW_CONFIG_PATH = pawConfig;
  }

  /**
   * Set the environment config path, i.e. the path pointing to
   * .env specified by user
   * @param envConfigPath
   */
  setEnvConfigPath(envConfigPath: string): boolean {
    let ecp = envConfigPath;
    if (!path.isAbsolute(ecp)) {
      ecp = path.resolve(processDir, ecp);
    }
    if (fs.existsSync(ecp)) {
      process.env.ENV_CONFIG_PATH = ecp;

      /**
       * On setting ENV_CONFIG_PATH, execute the command,
       * to process ENV config Path
       */
      this.processEnvConfigPath();
      return true;
    }
    return false;
  }

  /**
   * Process env from .env file specified
   * in the process.env variable
   */
  processEnvConfigPath(): void {
    const envConfigPath: any = process.env.ENV_CONFIG_PATH;
    if (typeof envConfigPath !== 'string') {
      return;
    }
    /**
     * Parse the env file with plugin with dotenv and add all the variables in
     * .env file to process.env
     */
    const envConfig = dotenv.parse(fs.readFileSync(envConfigPath));
    Object.keys(envConfig).forEach((e) => {
      process.env[e] = envConfig[e];

      /**
       * While adding variables from .env file, if we find a variable for
       * PROJECT_ROOT, then update the project root immediately
       * also let the process know that the project root is manually set.
       */
      if (e === 'PROJECT_ROOT') {
        this.updateProjectRoot(envConfig[e]);
      }
    });
  }

  /**
   * Specify the project root directory
   * @param projectRootDir
   */
  updateProjectRoot(projectRootDir: string) {
    // store the absolute value of project root
    let pRoot = projectRootDir;
    if (!path.isAbsolute(projectRootDir)) {
      pRoot = path.resolve(processDir, projectRootDir);
    }
    const pathStats = fs.lstatSync(pRoot);
    if (!pathStats.isDirectory()) {
      // eslint-disable-next-line
      console.warn(`WARNING:: Invalid root directory specified ${projectRootDir},
      using ${this.projectRoot} instead`);
      return;
    }
    process.env.PROJECT_ROOT = pRoot;
    this.projectRoot = process.env.PROJECT_ROOT;
    this.updateExecutablePaths();
    this.updateCommandSearch();
  }

  /**
   * Start server depending on the env variable
   */
  startServer() {
    process.env.PAW_HOT = typeof process.env.PAW_HOT !== 'undefined' ? process.env.PAW_HOT : 'true';
    // eslint-disable-next-line global-require,import/no-dynamic-require
    require(pawExistsSync(path.join(this.libRoot, 'src/server/webpack-start')));
  }

  buildProd() {
    process.env.PAW_HOT = typeof process.env.PAW_HOT !== 'undefined'
      ? process.env.PAW_HOT
      : 'false';
    // eslint-disable-next-line global-require,import/no-dynamic-require
    require(pawExistsSync(path.join(this.libRoot, 'src/server/webpack-build')));
  }

  lint() {
    if (!this.searchCommand) {
      // eslint-disable-next-line no-console
      console.log('Application not configured properly, cannot search for commands');
      return;
    }
    const env = Object.create(process.env);
    env.NODE_ENV = 'test';

    let eslintPath = path.join(this.libRoot, '.eslintrc');
    let eslintRoot = this.libRoot;
    if (fs.existsSync(path.join(this.projectRoot, '.eslintrc'))) {
      eslintPath = path.join(this.projectRoot, '.eslintrc');
      eslintRoot = this.projectRoot;
    } else if (fs.existsSync(path.join(this.projectRoot, '.eslintrc.js'))) {
      eslintPath = path.join(this.projectRoot, '.eslintrc.js');
      eslintRoot = this.projectRoot;
    }

    const srcDir = fs.existsSync(path.join(eslintRoot, 'src'))
      ? path.join(eslintRoot, 'src')
      : eslintRoot;
    // eslint-disable-next-line
    console.log(`Linting with eslint...\nConfig path: ${eslintPath}`);
    const eslint = spawn(
      this.searchCommand('eslint'),
      [
        '-c',
        eslintPath,
        srcDir,
      ],
      {
        env,
        shell: true,
        stdio: [process.stdin, process.stdout, 'pipe'],
      },
    );

    eslint.on('close', (errorCode) => {
      if (!this.searchCommand) {
        // eslint-disable-next-line no-console
        console.log('Application not configured properly, cannot search for commands');
        return;
      }
      if (!errorCode) {
        let tslintPath = path.join(this.libRoot, 'tslint.json');
        let tslintRoot = this.libRoot;
        if (fs.existsSync(path.join(this.projectRoot, 'tslint.json'))) {
          tslintPath = path.join(this.projectRoot, 'tslint.json');
          tslintRoot = this.projectRoot;
        }
        const tsSrcDir = fs.existsSync(path.join(tslintRoot, 'src'))
          ? path.join(tslintRoot, 'src')
          : tslintRoot;

        // eslint-disable-next-line
        console.log(`Linting with tslint...\nConfig path: ${tslintPath}`);
        spawn(
          this.searchCommand('tslint'),
          [
            '-c',
            tslintPath,
            `${tsSrcDir}/**/*.ts{,x}`,
          ],
          {
            env,
            shell: true,
            stdio: [process.stdin, process.stdout, 'pipe'],
          },
        );
      }
    });
  }

  test() {
    if (!this.searchCommand) {
      // eslint-disable-next-line no-console
      console.log('Application not configured properly, cannot search for commands');
      return;
    }
    const env = Object.create(process.env);
    env.NODE_ENV = 'test';

    let tscRoot = this.libRoot;
    if (fs.existsSync(path.join(this.projectRoot, 'tsconfig.json'))) {
      tscRoot = this.projectRoot;
    }
    const tsc = spawn(this.searchCommand('tsc'), ['-p', tscRoot], {
      env,
      shell: true,
      stdio: [process.stdin, process.stdout, 'pipe'],
    });

    tsc.on('close', (errorCode) => {
      if (!this.searchCommand) {
        // eslint-disable-next-line no-console
        console.log('Application not configured properly, cannot search for commands');
        return;
      }
      if (!errorCode) {
        spawn(this.searchCommand('jest'), ['--verbose'], {
          env,
          shell: true,
          stdio: [process.stdin, process.stdout, 'pipe'],
        });
      }
    });
  }

  run() {
    this.program
      .version(packageDetails.version, '-V, --version');

    /**
     * The next highest priority is the dotenv file
     * for env variables update
     */
    this.program.option(
      '--env-config-path <envConfigPath>',
      'Set path to environment file handled via DotEnv',
    );

    /**
     * Second highest priority is updating the project root via CLI
     */
    this.program.option('-r, --root <projectRootDir>', 'Set the project root');

    this.program.option('-v, --verbose', 'Start with detailed comments and explanation');
    this.program.option('-e, --env <env>', 'Set the application environment default is dev env');
    this.program.option(
      '-nc, --no-cache',
      'Disable cache. Ideally used for PawJS core/plugin development',
    );

    this.program.option('-c, --config <configPath>', '(DEPRECATED) Set path to pawconfig.json');

    this.program
      .command('start')
      .description('Start the application')
      .action(this.startServer);

    this.program
      .command('build')
      .description('Compile the project for production.')
      .action(this.buildProd);

    this.program
      .command('test')
      .description('Run the test cases for the project.')
      .action(this.test);

    this.program
      .command('lint')
      .description('Run eslint & tslint for the project.')
      .action(this.lint);

    /**
     * When an option is specified for env-config-path, then read the
     * .env file from the specified path
     */
    this.program.on('option:env-config-path', (e) => {
      let ecp = e;
      if (!path.isAbsolute(ecp)) {
        ecp = path.resolve(processDir, ecp);
      }
      if (ecp !== path.resolve(processDir, '.env')) {
        this.setEnvConfigPath(ecp);
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
        console.info('NOTE:: Setting env to development. Please use --env=development instead');
        env = 'development';
      }

      if (env === 'prod') {
        // eslint-disable-next-line
        console.info('NOTE:: Setting env to production. Please use --env=production instead');
        env = 'production';
      }
      process.env.PAW_ENV = env;

      // Force set NODE_ENV & ENV to production
      if (process.env.PAW_ENV === 'production' && typeof process.env.NODE_ENV === 'undefined') {
        process.env.NODE_ENV = env;
        process.env.ENV = env;
      }
    });

    this.program.on('option:cache', () => {
      if (!this.program.cache) {
        // set PAW_CACHE to false
        process.env.PAW_CACHE = 'false';

        // Disable babel cache if no-cache is specified
        process.env.BABEL_DISABLE_CACHE = 'true';
      }
    });

    // Update the project root based on the root option
    this.program.on('option:root', this.updateProjectRoot);

    // Update the pawconfig path
    this.program.on('option:config', this.updateConfigPath);

    this.program.on('command:*', () => {
      // eslint-disable-next-line
      console.error(
        'Invalid command: %s\nSee --help for a list of available commands.',
        Program.args.join(' '),
      );
      process.exit(1);
    });

    this.program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      this.startServer();
    }
  }
}
