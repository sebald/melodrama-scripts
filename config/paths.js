'use strict';
const path = require('path');
const fs = require('fs-extra');

/**
 * Resolve a relative bath based on current working directory.
 */
const cwd = fs.realpathSync(process.cwd());
const resolveFromCwd = (relativePath) => path.resolve(cwd, relativePath);

/**
 * Path configuration.
 */
module.exports = {
  resolveFromCwd,

  package: resolveFromCwd('package.json'),
  build: resolveFromCwd('build'),
  src: resolveFromCwd('src'),
  theme: {
    html: resolveFromCwd('src/index.html'),
    favicon: resolveFromCwd('src/favicon.png')
  }
};