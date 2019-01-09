const fs = require('fs');
const { resolve, join } = require('path');
const cp = require('child_process');
const os = require('os');

// get packages path
const lib = resolve(__dirname, './packages/');

fs.readdirSync(lib)
  .forEach((mod) => {
    const modPath = join(lib, mod);
    // ensure path has package.json
    if (!fs.existsSync(join(modPath, 'package.json'))) return;

    // npm binary based on OS
    const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

    // Install folder
    cp.spawnSync(npmCmd, ['i'], { env: process.env, cwd: modPath, stdio: 'inherit' });
    cp.spawnSync(npmCmd, ['run', 'build'], { env: process.env, cwd: modPath, stdio: 'inherit' });
  });
