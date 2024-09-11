// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add the crypto fallback
  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
  };

  return config;
};