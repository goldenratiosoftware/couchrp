var express = require( 'express' )
  , url = require( 'url' )

  , app = express()
  , vhost = express()
  , vhostPort = 1337

  , api = require( './routes/api' );


app.configure(function() {
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('less-middleware')({ src: __dirname + '/assets', compress: true }));
  app.use(express.static(__dirname + '/assets'));
});


app.get(  '/api', api.methods );

app.get(  '/api/user', api.readUsers );
app.post( '/api/user', api.createUser );
app.get(  '/api/user/:username', api.readUser );
app.put(  '/api/user/:username', api.updateUser );
app.del(  '/api/user/:username', api.deleteUser );

app.get(  '/api/master', api.readMasterDataSets );
app.post( '/api/master', api.createMasterData );
app.get(  '/api/master/:data', api.readMasterData );
app.put(  '/api/master/:data', api.updateMasterData );
app.del(  '/api/master/:data', api.deleteMasterData );
app.put(  '/api/master/:data/:field', api.updateMasterDataField );
app.del(  '/api/master/:data/:field', api.removeMasterDataField );

app.all( '((?!(js|css|img|partials|api).))*$', function( req, res ) {
  res.sendfile( 'assets/index.html' );
} );


vhost.configure(function() {
  vhost.use(express.logger('dev'));
});


vhost.use(express.vhost('*', app));


vhost.listen(vhostPort);
console.info('[info] vhost server running on http://127.0.0.1:' + vhostPort);