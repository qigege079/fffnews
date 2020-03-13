module.exports = {
  devServer: {
    proxy: {
      '/mock': {
        target: 'http://hty_test.duoc.cn/',
        changeOrigin: true,
      }
    }   
  },

  configureWebpack: {
    entry: ['babel-polyfill', './src/main.js'],
  }
}