// // craco.config.js
// module.exports = {
//     webpack: {
//       configure: (webpackConfig) => {
//         webpackConfig.resolve.fallback = {
//           crypto: require.resolve('crypto-browserify'),
//         };
//         return webpackConfig;
//       },
//     },
//   };
  

// craco.config.js
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.resolve.fallback = {
          crypto: false,
        };
        return webpackConfig;
      },
    },
  };
  