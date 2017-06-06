const fs = require('fs-extra');
const prettyMs = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const webpack = require('webpack');
const createConfig = require('./webpack.config');


/**
 * Clear build directory, so we do not have some deprecated files in it.
 */
const clearDirectory = dir => new Promise((resolve, reject) => {
  fs.emptyDir(dir, err => {
    if (err) { reject(err); }
    return resolve(dir);
  });
});

/**
 * Run webpack!
 */
const createBundle = config => new Promise((resolve, reject) => {
  webpack(config).run((err, stats) => {
    if (err) {
      return reject(err);
    }
    const { errors, time, assets } = stats.toJson({}, true);
    if (errors.length) {
      return reject(errors);
    }
    resolve({
      output: config.output.path,
      time: prettyMs(time),
      size: prettyBytes(assets.map(c => c.size).reduce((sum, size) => sum + size, 0))
    });
  });
});

/**
 * Bundle presentation.
 */
module.exports = (entry, include) => {
  // Add some optimization plugins to minimize bundle size.
  let config = createConfig(entry, include);
  config.devtool = 'cheap-module-source-map';
  config.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    })
  );
  const outDir = config.output.path;
  return clearDirectory(outDir).then(() => createBundle(config));
};