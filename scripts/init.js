#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const emoji = require('node-emoji').get;
const PrettyError = require('pretty-error');
const meow = require('meow');
const resolveFromCwd = require('../lib/paths').resolveFromCwd;
const { run } = require('../lib/bootstrap');

const cli = meow({
  description: false,
  help:
`
  ${chalk.underline('Usage:')}
    $ init [dir] [options]

  ${chalk.underline('Options:')}
    -h, --help        output usage information
    -v, --version     output the version number
    --verbose         print logs while executing command
`
}, {
  alias: {
    v: 'version'
  },
  boolean: ['help', 'verbose', 'version']
});


/**
 * Init has to:
 *
 * (1) Copy template to <dir>
 * (2) Add `scripts` to `package.json`
 * (3) Install dependencies (react, ...)
 * (4) Ask for syntax highlithing
 * (5) Ask for theme
 *
 */
run(resolveFromCwd(cli.input[0] || '.'), { verbose: cli.flags.verbose })
  .then(() => {
    console.log(chalk.bold.green(`${emoji('checkered_flag')} Bootstrapping done!`));
    process.exit();
  })
  .catch(err => {
    const pe = new PrettyError();
    console.log();
    console.log(chalk.red(`${emoji('rotating_light')} Bootstrapping failed because of the following reasons:`));
    console.log(pe.render(err));
    process.exit();
  });