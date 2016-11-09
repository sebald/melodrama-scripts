#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const meow = require('meow');
const lib = require('../lib');

const cli = meow({
  description: false,
  help:
`
  ${chalk.underline('Usage:')}
    $ melodrama-scripts <command> [options]

  ${chalk.underline('Commands:')}
    init [dir]        bootstrap project dir
    start <file>      run dev server with file as entry

  ${chalk.underline('Options:')}
    -p, --protocol    use custom port (Default: 3000)
    -h, --host        use custom host (Default: localhost)
    -h, --help        output usage information
    -v, --version     output the version number
    --verbose         print logs while executing command
`
}, {
  alias: {
    v: 'version',
    p: 'protocol',
    h: 'host'
  },
  default: {
    port: 3000,
    host: 'localhost'
  },
  boolean: ['help', 'verbose', 'version'],
  string: ['protocol', 'host']
});

const script = cli.input.shift();
const command = lib[script];
// Check if requested script is known.
if (!command) {
  console.log(chalk.bold(`Unknown script "${script}".`));
  process.exit();
}
// Invoke script with input and flags.
command(cli.input[0], cli.flags);