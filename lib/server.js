const chalk = require('chalk');
const emoji = require('node-emoji').get;
const open = require('open');
const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

const createConfig = require('./webpack.config');
const { createCompileSpinner, createSection } = require('./utils');


/**
 * Create a Webpack dev server with hot reloading.
 */
module.exports = function runServer (entry, host, port) {
  let first_compile = false;
  const spinner = createCompileSpinner();

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
  compiler.plugin('invalid', () => spinner.compiling());
  compiler.plugin('done', stats => {
    const { errors, warnings, time, chunks } = stats.toJson({}, true);

    // Only show errors, if there are some.
    if (errors.length) {
      spinner.fail();
      errors.forEach(msg => console.log(msg));
      console.log(createSection());
      return;
    }

    // Only show warnings, if there are some.
    if (warnings.length) {
      spinner.warn();
      warnings.forEach(msg => console.log(msg));
      console.log(createSection());
      return;
    }

    // Open browser when successfully compiled the first time.
    if (!first_compile) {
      first_compile = true;
      open(`http://${host}:${port}`);
    }
    spinner.success(time, chunks.map(c => c.size).reduce((sum, size) => sum + size, 0));
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
    console.log(`${emoji('performing_arts')}  Starting server @ ${chalk.italic(`http://${host}:${port}`)}!`);
    spinner.compiling();
  });
};