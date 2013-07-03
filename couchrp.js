var express = require('express')
  , url = require('url')

  , main = express()
  , webdav = express()
  , webdavPort = 8000
  , app = express()
  , appPort = 80

  , jsdavServer = require('jsDAV/lib/DAV/server')
  , jsdav = require('jsDAV/lib/jsdav')
  , jsdavLocksBackendFS = require('jsDAV/lib/DAV/plugins/locks/fs')
  , jsdavPort = 8000;


main.get('/', function(req, res) {
  res.end('Hello World!');
});


webdav.all('*', function(req, res) {
  res.redirect(req.protocol + '://' + req.host + ':' + webdavPort);
});


jsdav.createServer({
  node: __dirname + '/dav/public',
  locksBackend: jsdavLocksBackendFS.new(__dirname + '/dav/data')
}, webdavPort);


app.use(express.vhost('webdav.*', webdav));
app.use(express.vhost('*', main));

app.listen(appPort);
console.log('vhost server running on http://127.0.0.1:' + appPort);