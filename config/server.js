'use strict';

const chalk = require('chalk');
const open = require('open');
const prettyMs = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const createConfig = require('./webpack.config');


module.exports = function runServer (entry, host, port) {
  let first_compile = false;

  // Create config and add hot-reloading!
  let config = createConfig(entry);
  config.entry.unshift(
    `webpack-dev-server/client?http://${host}:${port}`,
    'webpack/hot/dev-server'
  );
  config.plugins.unshift(
    new webpack.HotModuleReplacementPlugin()
  );

  // Setup compiler
  // Webpack is tooo noisy, we take over the messages!
  const compiler = webpack(config);
  compiler.plugin('invalid', () => {
    console.log('\u{1f4c0}  Compiling...');
  });
  compiler.plugin('done', stats => {
    const { errors, warnings, time, chunks } = stats.toJson({}, true);

    // Only show errors, if there are some.
    if (errors.length) {
      console.log(chalk.red('\u{1f480}  Compiliation error!'));
      errors.forEach(msg => console.log(msg));
      return;
    }

    // Only show warnings, if there are some.
    if (warnings.length) {
      console.log(chalk.yellow('\u26a0  Compiled with warnings!'));
      warnings.forEach(msg => console.log(msg));
      return;
    }

    // Open browser when successfully compiled the first time.
    if (!first_compile) {
      first_compile = true;
      open(`http://${host}:${port}`);
    }
    const bundle_size = chunks.map(c => c.size).reduce((sum, size) => sum + size, 0);
    console.log(chalk.green('\u267b  Compiled successfully! ') + chalk.dim(`(${prettyMs(time)}, ${prettyBytes(bundle_size)})`));
  });

  const server = new WebpackDevServer(compiler, {
    clientLogLevel: 'none',
    quiet: true,
    compress: true,
    hot: true,
    publicPath: config.output.publicPath,
    watchOptions: {
      ignored: /node_modules/
    },
    host: host
  });

  // Start server!
  server.listen(port, err => {
    if (err) {
      return console.log(chalk.red(err));
    }
    console.log(`\u{1f984}  Starting server @ http://${host}:${port} ...`);
  });
};