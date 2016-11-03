#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const detect = require('detect-port');
const emoji = require('node-emoji').get;
const fs = require('fs-extra');
const meow = require('meow');
const runServer = require('../lib/server');
const resolveFromCwd = require('../lib/utils').resolveFromCwd;


// CLI interface
process.env.NODE_ENV = 'development';
const cli = meow({
  description: false,
  help:
`
  Usage
    $ start [file] [options]

  Options
    -p, --protocol    use custom port (Default: 3000)
    -h, --host        use custom host (Default: localhost)

  Examples
    $ start index.js
`
}, {
  alias: {
    p: 'protocol',
    h: 'host'
  },
  default: {
    port: 3000,
    host: 'localhost'
  }
});


/**
 * (1) Check if chosen port is available, if not go and find another one.
 * (2) Check for the entry file.
 * (3) Finally, run the dev server.
 */
detect(cli.flags.port).then(port => {
  if (port !== cli.flags.port) {
    console.log(chalk.yellow(`${emoji('passenger_ship')}  Port ${cli.flags.port} already used, using port ${port} instead.`));
  }

  const entry = resolveFromCwd(cli.input[0] || 'index.js');
  if (!fs.existsSync(entry)) {
    console.log(chalk.red(`${emoji('no_entry')}  Missing entry file! No file at ${chalk.italic(entry)} found!`));
    process.exit();
  }

  runServer(entry, cli.flags.host, port);
});