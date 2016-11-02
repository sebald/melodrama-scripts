'use strict';

const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');
const pkg = require(paths.package);

module.exports = function createConfig (entry) {
  return {
    devtool: 'eval',
    entry: [ entry ],
    output: {
      path: paths.build,
      filename: 'bundle.js',
      publicPath: '/',
      pathinfo: true
    },
    resolve: {
      extensions: ['.js', '.json', '.jsx', ''],
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
        },
        include: [paths.src, entry]
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
        title: `Slides | ${pkg.name.split('-').join(' ')}`,
        template: paths.theme.html,
        favicon: paths.theme.favicon
      })
    ]
  };
};