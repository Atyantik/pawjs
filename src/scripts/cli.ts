import ChildProcess from 'child_process';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import packageDetails from '../../package.json';

const { spawn } = ChildProcess;

/**
 * Current process directory
 */
const processDir: string = process.cwd();

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
  program: typeof program = program;

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
   * A flag to check if the pawConfig was set manually
   * via the CLI or ENV
   */
  pawConfigManualPath: boolean = false;

  constructor() {
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
    process.env.PROJECT_ROOT = (processDir + path.sep);
    /**
     * Update the project root, now this is a separate function as
     * updating project root updates lots of ENV PATH, thus we have a different function
     * for updating Project Root
     */
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
  }

  /**
   * Start server depending on the env variable
   */
  startServer() {
    process.env.PAW_HOT = process.env.PAW_HOT ?? (process.env.PAW_ENV === 'development' ? 'true' : 'false');
    process.env.PAW_START_CMD = 'true';
    import('../server/webpack-start');
  }

  buildProd() {
    process.env.PAW_HOT = 'false';
    process.env.PAW_START_CMD = 'false';
    import('../server/webpack-build');
  }

  lint() {
    const env = Object.create(process.env);
    env.NODE_ENV = 'test';

    let eslintPath = path.join(this.libRoot, '.eslintrc.json');
    let eslintRoot = this.libRoot;
    if (fs.existsSync(path.join(this.projectRoot, '.eslintrc'))) {
      eslintPath = path.join(this.projectRoot, '.eslintrc');
      eslintRoot = this.projectRoot;
    } else if (fs.existsSync(path.join(this.projectRoot, '.eslintrc.js'))) {
      eslintPath = path.join(this.projectRoot, '.eslintrc.js');
      eslintRoot = this.projectRoot;
    } else if (fs.existsSync(path.join(this.projectRoot, '.eslintrc.json'))) {
      eslintPath = path.join(this.projectRoot, '.eslintrc.json');
      eslintRoot = this.projectRoot;
    }

    const srcDir = fs.existsSync(path.join(eslintRoot, 'src'))
      ? path.join(eslintRoot, 'src')
      : eslintRoot;
    // eslint-disable-next-line
    console.log(`Linting with eslint...\nConfig path: ${eslintPath}`);
    spawn(
      'eslint',
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
  }

  test() {
    const env = Object.create(process.env);
    env.NODE_ENV = 'test';
    spawn('jest', ['--verbose'], {
      env,
      shell: true,
      stdio: [process.stdin, process.stdout, 'pipe'],
    });
  }

  run() {
    this.program
      .version(packageDetails.version, '-V, --version');

    this.program.option('-v, --verbose', 'Start with detailed comments and explanation');
    this.program.option('-e, --env <env>', 'Set the application environment default is dev env');
    this.program.option(
      '-nc, --no-cache',
      'Disable cache. Ideally used for PawJS core/plugin development',
    );

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

    this.program.on('option:no-cache', () => {
      const cache =  this.program?.opts?.()?.cache ?? true;
      if (!cache) {
        // set PAW_CACHE to false
        process.env.PAW_CACHE = 'false';

        // Disable babel cache if no-cache is specified
        process.env.BABEL_DISABLE_CACHE = 'true';
      }
    });

    this.program.on('command:*', () => {
      // eslint-disable-next-line
      console.error(
        'Invalid command: %s\nSee --help for a list of available commands.',
        program.args.join(' '),
      );
      process.exit(1);
    });

    this.program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      this.startServer();
    }
  }
}
