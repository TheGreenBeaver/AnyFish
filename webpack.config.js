const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /\.yarn/,
        loader: require.resolve('ts-loader'),
        options: {
          configFile: 'cypress/tsconfig.json',
        },
      },
      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource'
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx'],
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
};