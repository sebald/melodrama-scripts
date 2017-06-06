const path = require('path');
const fs = require('fs-extra');

/**
 * Resolve a (relative) path based on current working directory.
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
  framework: path.resolve(__dirname, './presentation.js'),
  assets: {
    html: path.resolve(__dirname, './assets/index.html'),
    favicon: path.resolve(__dirname, './assets/favicon.png')
  }
};