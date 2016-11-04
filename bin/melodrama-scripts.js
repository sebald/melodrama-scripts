#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const spawn = require('cross-spawn');
const meow = require('meow');

const cli = meow({
  description: false,
  help:
`
  ${chalk.underline('Usage:')}
    $ melodrama-scripts <command> [options]

  ${chalk.underline('Usage:')}
    init [dir]        bootstrap project dir
    start [file]      run dev server with file as entry

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
 * Validate input.
 */
const script = cli.input.shift();
if (!/init|start/.test(script)) {
  console.log(chalk.bold(`Unknown script "${script}".`));
  process.exit();
}

/**
 * Parse input and execute script.
 *
 * We can not use `execa` here, b/c it doesn't support
 * inheriting stdio, which is required to have `inquierer`
 * work in a child process.
 */
const child = spawn(
  'node',
  [
    require.resolve('../scripts/' + script),
    cli.input.join(' '),
    cli.flags.verbose ? '--verbose' : ''
  ],
  { stdio: 'inherit' }
);
child.on('error', err => console.log(chalk.red(err)));
child.on('close', code => process.exit(code));