let path = require('path');
let webpack = require('webpack');
 
module.exports = {
  entry: './jssrc/main.jsx',
  output: { path: path.resolve(__dirname, "dist"), filename: 'bundle.js', publicPath: "dist"},
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
};
