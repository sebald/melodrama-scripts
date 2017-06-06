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
    build <file>      build with file as entry

  ${chalk.underline('Options:')}
    -i, --include     directory to include
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
    h: 'host',
    i: 'include'
  },
  default: {
    port: 3000,
    host: 'localhost',
    include: './assets'
  },
  boolean: ['help', 'verbose', 'version'],
  string: ['protocol', 'host', 'include']
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