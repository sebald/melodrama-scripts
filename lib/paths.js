const path = require('path');
const resolveFromCwd = require('./utils').resolveFromCwd;

/**
 * Path configuration.
 */
module.exports = {
  package: resolveFromCwd('package.json'),
  build: resolveFromCwd('build'),
  assets: {
    html: path.resolve(__dirname, './assets/index.html'),
    favicon: path.resolve(__dirname, './assets/favicon.png')
  }
};