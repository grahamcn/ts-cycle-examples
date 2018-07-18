const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

const isDevelopment = process.env.NODE_ENV === 'development'

const envPlugins = isDevelopment ? [] : [
	new CleanWebpackPlugin(['dist']),
	new UglifyJsPlugin(),
	new OptimizeCSSAssetsPlugin(),
]

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  devtool: isDevelopment ? 'inline-source-map' : undefined,
  devServer: {
    contentBase: './dist',
		hot: true,
		port: 8181,
		host: '0.0.0.0',
    historyApiFallback: true,
  },
  plugins: [
    new MiniCssExtractPlugin({}),
    new HtmlWebpackPlugin({template: './src/index.html'}),
    new webpack.HotModuleReplacementPlugin(),
  ].concat([...envPlugins]),
  module: {
    rules: [{
      test: /\.(ts)$/,
      exclude: /node_modules/,
      use: [
        'babel-loader',
        'ts-loader',
      ],
    }, {
      test: /\.css$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
        },
        'css-loader',
      ]
    }, {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [
        'file-loader'
      ]
    }]
  },
  resolve: {
    extensions: ['.ts'],
  },
};
