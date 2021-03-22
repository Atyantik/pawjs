import * as ChildProcess from 'child_process';
import { program } from 'commander';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import { pawExistsSync } from '../global';
import executablePaths from './executable-paths';

import packageDetails from '../../package.json';
import { factory as findCommandFactory } from './find-command';

const { spawnSync } = ChildProcess;

/**
 * Current process directory
 */
const processDir: string = path.resolve(process.cwd());

/**
 * We need the program to exit clean even if the
 * user triggered ctrl+c or via any other interrupt.
 */
const cleanExit = (): void => process.exit();
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

export default class CliHandler {
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
    // Bind to methods to class
    this.updateProjectRoot = this.updateProjectRoot.bind(this);
    this.startServer = this.startServer.bind(this);
    this.buildProd = this.buildProd.bind(this);
    this.test = this.test.bind(this);
    this.lint = this.lint.bind(this);

    // Initialize the env with defaults
    this.initProcessEnv();
    /**
     * Update the project root, now this is a separate function as
     * updating project root updates lots of ENV PATH, thus we have a different function
     * for updating Project Root
     */
    this.updateProjectRoot(this.projectRoot);
    /**
     * Update executable paths
     */
    this.updateExecutablePaths();
    /**
     * Update command search based on the current project root and library root
     */
    this.updateCommandSearch();
  }

  /**
   * Initialize default environment variables
   */
  initProcessEnv() {
    // Try to read the .env from the current directory that
    // is processing the request, if the file exists in the current directory
    if (fs.existsSync(path.resolve(processDir, '.env'))) {
      this.setEnvConfigPath(path.resolve(processDir, '.env'));
    }

    // PawJS library root, i.e. the folder where the script file is located
    // Point to note here is we do not care if user specified LIB_ROOT in .env
    // We calculate it on basis of this file being executed!
    this.libRoot = path.resolve(path.join(__dirname, '..', '..'));

    // Update the current LIB_ROOT environment
    process.env.LIB_ROOT = this.libRoot;

    // Set PawJS cache to true by default
    process.env.PAW_CACHE = 'true';

    /**
     * Setting verbose mode to false by default,
     * enabling verbose mode gives extra details of compilation to user on terminal
     * which might not be necessary.
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
    this.projectRoot = (
      /**
       * If already stored then reuse the PROJECT_ROOT from env variable,
       * like `PROJECT_ROOT=./demo pawjs start`
       */
      process.env.PROJECT_ROOT

      // If not provided then consider the current directory of the process as project root
      || processDir
    );
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
  }

  updateCommandSearch() {
    // get the search command with the executable path list
    this.searchCommand = findCommandFactory(executablePaths(this.projectRoot, this.libRoot));
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
      // eslint-disable-next-line no-console
      console.warn(`WARNING:: Invalid root directory specified ${projectRootDir},
      using ${this.projectRoot} instead`);
      return;
    }
    process.env.PROJECT_ROOT = pRoot;
    this.projectRoot = process.env.PROJECT_ROOT;
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

    const srcDir = fs.existsSync(path.join(processDir, 'src'))
      ? path.join(this.projectRoot, 'src')
      : this.projectRoot;

    spawnSync(
      this.searchCommand('eslint'),
      [
        srcDir,
      ],
      {
        env,
        shell: true,
        stdio: [process.stdin, process.stdout, process.stderr],
      },
    );
  }

  test() {
    if (!this.searchCommand) {
      // eslint-disable-next-line no-console
      console.log('Application not configured properly, cannot search for commands');
      return;
    }
    const env = Object.create(process.env);
    env.NODE_ENV = 'test';

    spawnSync(this.searchCommand('jest'), ['--verbose'], {
      env,
      shell: true,
      stdio: [process.stdin, process.stdout, 'pipe'],
    });
  }

  run() {
    program
      .version(packageDetails.version, '-V, --version');

    /**
     * Second highest priority is updating the project root via CLI
     */
    program.option('-r, --root <projectRootDir>', 'Set the project root');

    program.option('-v, --verbose', 'Start with detailed comments and explanation');
    program.option('-e, --env <env>', 'Set the application environment default is development environment');
    program.option(
      '-nc, --no-cache',
      'Disable cache. Ideally used for PawJS core/plugin development',
    );

    program
      .command('start')
      .description('Start the application')
      .action(this.startServer);

    program
      .command('build')
      .description('Compile the project for production.')
      .action(this.buildProd);

    program
      .command('test')
      .description('Run the test cases for the project.')
      .action(this.test);

    program
      .command('lint')
      .description('Run eslint & tslint for the project.')
      .action(this.lint);

    // Set PAW_VERBOSE to true
    program.on('option:verbose', () => {
      process.env.PAW_VERBOSE = 'true';
    });

    // Set Environment to
    program.on('option:env', (e) => {
      let env = e;
      if (!env) return;
      env = env.toLowerCase();
      if (env === 'dev') {
        // eslint-disable-next-line no-console
        console.info('NOTE:: Setting env to development. Please use --env=development instead');
        env = 'development';
      }

      if (env === 'prod') {
        // eslint-disable-next-line no-console
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

    program.on('option:cache', () => {
      // eslint-disable-next-line no-console
      console.log('Am here');
      const opts = program.opts();
      if (!opts.cache) {
        // set PAW_CACHE to false
        process.env.PAW_CACHE = 'false';
        process.env.BABEL_DISABLE_CACHE = 'true';
        // Disable babel cache if no-cache is specified
        // eslint-disable-next-line no-console
        console.log('HAAHAH@!!@!@!-->>');
      }
    });

    // Update the project root based on the root option
    program.on('option:root', this.updateProjectRoot);

    program.on('command:*', () => {
      // eslint-disable-next-line no-console
      console.error(
        'Invalid command: %s\nSee --help for a list of available commands.',
        program.args.join(' '),
      );
      process.exit(1);
    });

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      this.startServer();
    }
  }
}
