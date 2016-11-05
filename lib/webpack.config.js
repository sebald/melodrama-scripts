const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');
const pkg = require(paths.package);
const presentation = require.resolve('./presentation');


/**
 * Base Webpack configuration.
 */
module.exports = function createConfig (entry) {
  return {
    devtool: 'eval',
    entry: [entry],
    output: {
      path: paths.build,
      filename: 'bundle.js',
      publicPath: '/',
      pathinfo: true
    },
    resolve: {
      extensions: ['.js', '.json', '.jsx', ''],
      alias: {
        melodrama: presentation
      }
    },
    module: {
      loaders: [{
        test: /\.md$/,
        loader: 'html!markdown?gfm=false'
      }, {
        test: /\.(js|jsx)$/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          babelrc: false,
          compact: false
        }
      }, {
        test: /\.css$/,
        loader: 'style!css'
      }, {
        test: /\.json$/,
        loader: 'json'
      }, {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$/,
        loader: 'file'
      }]
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      new HtmlWebpackPlugin({
        title: `Slides | ${pkg.name.replace(/[-]/g,' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        template: paths.assets.html,
        favicon: paths.assets.favicon
      })
    ]
  };
};