#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const detect = require('detect-port');
const fs = require('fs-extra');
const meow = require('meow');
const resolvePath = require('../utils/path.utils').resolvePath;
const runServer = require('../config/server');
const resolveFromCwd = require('../config/paths').resolveFromCwd;


// Get/set enviroment
process.env.NODE_ENV = 'development';
const cli = meow(`
  Usage
    $ start <file>

  Options
    -p, --protocol  Run dev-server on custom port (Default: 3000)
    -h, --host      Run dev-server on custom host (Default: localhost)

  Examples
    $ start index.js
`, {
  alias: {
    p: 'protocol',
    h: 'host'
  },
  default: {
    port: 3000,
    host: 'localhost'
  }
});


// Check if the default port 3000 is available, if not
// go and find another one. Check for the entry file.
// Finally, run the dev server.
detect(cli.flags.port).then(port => {
  if (port !== cli.flags.port) {
    console.log(chalk.yellow(`Port ${cli.flags.port} already used, using port ${port} instead.`));
  }

  const entry = resolveFromCwd(pathcli.input[0] || 'index.js');
  if (!fs.existsSync(entry)) {
    console.log(chalk.red(`Missing entry file! No file at ${chalk.dim(entry)} found!`));
    return;
  }

  runServer(entry, cli.flags.host, port);
});