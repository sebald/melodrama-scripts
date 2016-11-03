const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
const prettyMs = require('pretty-ms');
const prettyBytes = require('pretty-bytes');


/**
 * Capitalize ever word in given string `s`.
 */
module.exports.capitalize = s => s.replace(/[-]/g,' ').replace(/\b\w/g, l => l.toUpperCase());

/**
 * Resolve a (relative) path based on current working directory.
 */
const cwd = fs.realpathSync(process.cwd());
module.exports.resolveFromCwd = (relativePath) => path.resolve(cwd, relativePath);

/**
 * Ora is an awesome module, but it doesn't (yet) support writing
 * the same line. This "spinner" monkey patches this behaviour.
 */
module.exports.createCompileSpinner = () => {
  const spinner = ora('');

  return {
    compiling() {
      spinner.clear();
      spinner.text = 'Compiling...';
      spinner.start();
    },

    success(time, size) {
      spinner.stop();
      spinner.stream.write(
        chalk.green(`\u2714  Compilation done! `) +
        chalk.dim(`(${prettyMs(time)}, ${prettyBytes(size)})`)
      );
    },

    warn() {
      spinner.text = chalk.yellow('Compiled with warnings!');
      spinner.stopAndPersist(chalk.yellow('\u26a0'));
    },

    fail() {
      spinner.text = chalk.red('Compiled with errors!');
      spinner.fail();
    }
  };
};

/**
 * Create a section seperator in the CLI.
 * Stole this idea from an ava reporter (https://github.com/avajs/ava)
 */
module.exports.createSection = () => {
  return chalk.gray.dim('_'.repeat(process.stdout.columns || 80)) + '\n';
}