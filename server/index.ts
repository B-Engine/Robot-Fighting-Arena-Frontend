import path from 'path';
import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const app = express();
const DIST_DIR = path.resolve(__dirname, '../../dist/client/');
const HTML_FILE = path.join(DIST_DIR, 'index.html');
console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  console.log('I AM IN DEV MODE');
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../config/webpack.dev.config');
  const compiler = webpack(webpackConfig as any);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath
    })
  );
  app.use(webpackHotMiddleware(compiler));

  app.use(express.static(DIST_DIR));

  app.get('*', (req, res, next) => {
    compiler.outputFileSystem.readFile(HTML_FILE, (err: any, result: any) => {
      if (err) {
        return next(err);
      }
      res.set('content-type', 'text/html');
      res.send(result);
      res.end();
    });
  });
} else {
  app.use(express.static(DIST_DIR));

  app.get('/*', (req, res, next) => {
    res.set('content-type', 'text/html');
    res.sendFile(HTML_FILE);
  });
}

const PORT = process.env.PORT || 8080;
const server = new http.Server(app);
const io = socketIO(server);

io.on('connection', socket => {});

server.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to quit.');
});