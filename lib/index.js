const chalk = require('chalk');
const detect = require('detect-port');
const fs = require('fs-extra');
const logSymbols = require('log-symbols');
const ora = require('ora');
const PrettyError = require('pretty-error');

const resolveFromCwd = require('./paths').resolveFromCwd;
const runServer = require('./server');
const bootstrap = require('./bootstrap').run;
const bundle = require('./bundle');

/**
 * Init Script:
 *
 * (1) Copy template to <dir>
 * (2) Add `scripts` to `package.json`
 * (3) Install dependencies (react, ...)
 * (4) Ask for syntax highlithing
 * (5) Ask for theme
 */
const init = (dir, { verbose }) => {
  return bootstrap(dir, { verbose })
    .then(() => {
      console.log(chalk.bold.green(`${logSymbols.success} Bootstrapping done!`));
    })
    .catch(err => {
      const pe = new PrettyError();
      console.log();
      console.log(chalk.red(`${logSymbols.error} Bootstrapping failed because of the following reasons:`));
      console.log(pe.render(err));
    });
};

/**
 * Start Script:
 *
 * (1) Check for the entry file, if missing -> reject.
 * (2) Check if chosen port is available, if not go and find another one.
 * (3) Finally, run the dev server.
 */
const start = (dir, { include, port, host }) => {
  process.env.NODE_ENV = 'development';
  const entry = resolveFromCwd(dir || 'index.js');
  if (!fs.existsSync(entry)) {
    return Promise.reject(`${logSymbols.error} Missing entry file! No file at ${chalk.italic(entry)} found!`);
  }
  return detect(port).then(port => {
    if (port !== port) {
      console.log(`${logSymbols.info} Port ${port} already used, using port ${port} instead.`);
    }
    const include_dirs = include.split(/\s*,\s*/).map(resolveFromCwd);
    runServer(entry, include_dirs, host, port);
  });
};

/**
 * Build Script:
 *
 * (1) Clear build directory.
 * (2) Bundle minified presentation.
 */
const build = (dir, { include }) => {
  process.env.NODE_ENV = 'production';
  const entry = resolveFromCwd(dir || 'index.js');
  if (!fs.existsSync(entry)) {
    return Promise.reject(`${logSymbols.error} Missing entry file! No file at ${chalk.italic(entry)} found!`);
  }
  const spinner = ora(chalk.dim('Building presentation...')).start();
  return bundle(entry, include.split(/\s*,\s*/).map(resolveFromCwd))
    .then(({ output, size, time }) => {
      spinner.text = `Successfully build presentaion into ${chalk.italic(output)}!`;
      spinner.succeed();
      console.log(chalk.dim(`Time: ${time} | Size: ${size}`));
    })
    .catch(err => {
      const pe = new PrettyError();
      spinner.text = 'Build failed because of the following reasons:';
      spinner.fail();
      console.log(pe.render(err));
    });
};

module.exports = {
  init,
  start,
  build
};