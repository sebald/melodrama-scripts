const chalk = require('chalk');
const logSymbols = require('log-symbols');
const open = require('open');
const ora = require('ora');
const prettyMs = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const createConfig = require('./webpack.config');


/**
 * Ora is an awesome module, but it doesn't (yet?) support writing
 * the same line. This "spinner" monkey patches this behaviour.
 */
const createCompileSpinner = () => {
  const spinner = ora('');

  return {
    compiling() {
      spinner.clear();
      spinner.text = 'Compiling...';
      spinner.start();
    },

    success(time, size) {
      spinner.stop();
      spinner.stream.write(
        chalk.green(`${logSymbols.success} Compilation done! `) +
        chalk.dim(`(${prettyMs(time)}, ${prettyBytes(size)})`)
      );
    },

    warn() {
      spinner.text = chalk.yellow('Compiled with warnings!');
      spinner.stopAndPersist(logSymbols.warning);
    },

    fail() {
      spinner.text = chalk.red('Compiled with errors!');
      spinner.fail();
    }
  };
};


/**
 * Create a section seperator in the CLI.
 * Stole this idea from an ava reporter (https://github.com/avajs/ava)
 */
const createSection = () => {
  return chalk.gray.dim('_'.repeat(process.stdout.columns || 80)) + '\n';
};


/**
 * Create a Webpack dev server with hot reloading.
 */
module.exports = (entry, include, host, port) => {
  let first_compile = false;
  const spinner = createCompileSpinner();

  // Create config and add hot-reloading!
  let config = createConfig(entry, include);
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
    console.log(`${logSymbols.info} Starting server @ ${chalk.italic(`http://${host}:${port}`)}!`);
    spinner.compiling();
  });
};