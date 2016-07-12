module.exports = {
  entry: './client/index.js',

  output: {
    path: __dirname + '/public/scripts',
    filename: 'app.js',
    publicPath: '/'
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react&presets[]=stage-1' }
    ]
  }
}
