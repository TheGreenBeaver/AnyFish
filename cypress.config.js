module.exports = {
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./webpack.config'),
    },
  },
  video: false
};
