const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:1155',
      changeOrigin: false,
    }),
  );
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:1155',
      changeOrigin: false,
    }),
  );
};
