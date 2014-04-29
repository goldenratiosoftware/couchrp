var mongoClient = require( 'mongodb' ).MongoClient
  , path = require( 'path' )
  , users = false
  , master = false;


connectToDatabase();


/**
 * convenience method for establishing a connection to the mongodb database.
 * populates the globally visible collections with database objects.
 *
 * the connection to the database can be set by the process environment variable
 *     couchrp_rb
 *
 * by default it is set to
 *     mongodb://localhost:27017/couchrp
 */
function connectToDatabase() {
	mongoClient.connect( process.env.couchrp_db || 'mongodb://localhost:27017/couchrp', function( error, database ) {
		if ( error ) {
			return console.log( error.stackTrace );
		} else {
			users = database.collection( 'users' );
			master = database.collection( 'master' );
		}
	} );
}


/**
 * convenience method for ensuring that the database connection is set up
 * and all globally visible collections are filled up and useable.
 * 
 * @param res the result object errors are reported to.
 * @param next the callback method to be called when everything works fine.
 */
function safe( res, next ) {
	var missing = [];

	if ( !users ) missing.push( 'users' );
	if ( !master ) missing.push( 'master' );

	if ( missing.length > 0 ) {
		error( { 
			message: 'could not connect to database' + ( ( missing.length > 1 ) ? 's "' : ' "' ) + missing.join( ', ' ) + '"', 
			stackTrace: 'not able to connect to collections\n\t* ' + missing.join('\n\t* ') 
		}, res );

		connectToDatabase();
	} else if ( next ) {
		next();
	}
}


/**
 * convenience method for checking if an error happened. if the error happened,
 * a status code 500 is sent together with the message of the error. the stack trace
 * is logged in the system.
 *
 * @param error the error that might occur. 
 * @param res the result object the message should be sent to.
 */
function error( error, res ) {
	if ( error ) {
		res.status( 500 ).type( 'text/plain' );
		res.end( error.message );
		console.log( error.stackTrace );
	}
}

/**
 * GET /api
 *
 * @return a list of all available methods, like
 *     GET	/api/user - a list of all usernames
 *     POST	/api/user - create a new user
 */
exports.methods = function( req, res ) {
	todo( res );
};


// ===== user management ================================================================


/**
 * GET /api/user
 *
 * @return a list of all usernames the system knows. each can be used to call /api/user/:username. 
 */
exports.readUsers = function( req, res ) {
	safe( res, function() {
		users.find().toArray( function( err, list ) {
			var users = [];
			error( err, res );

			for ( var i = 0; i < list.length; i++ ) {
				users.push( list[ i ].user );
			}

			res.status( 200 ).json( users );
		} );
	} );
};


/**
 * POST /api/user
 *
 * creates a new user. needs a field { user: <username> } that tells the system, what the
 * username of the newly created user will be.
 *
 * @return the url of the newly created user. will be /api/user/:username.
 */
exports.createUser = function( req, res ) {
	var user = req.body.user;

	if ( !user ) {
		error( { 
			message: 'No username specified. Call again with { user: <username> }.', 
			stackTrace: '{ user: <username> } missing' 
		}, res );
	} else {
		safe( res, function() {
			buildUser( req.body, function( buildError, newUser ) {
				error( buildError, res );
				users.insert( newUser, function( insertError, result ) {
					error( insertError, res );
					res.send( 200, path.join( req.path, user ) );
				} );
			} );
		} );		
	}
};


/**
 * looks up master data fields for users, matches them with the data, and creates
 * a new json-object for the user including the intersection of the master data fields
 * and the given data fields.
 *
 * @param data the data (usually the request body) the new user is created from
 * @param next the callback function to be called with the newly created user
 */
function buildUser( data, next ) {
	master.findOne( { data: 'user' }, function( findOneError, result ) {
		var user = {}
		  , field = undefined;

		if ( findOneError ) { 
			next( findOneError ); 
		}

		for ( var i = 0; i < result.fields.length; i++ ) {
			field = result.fields[ i ];
			if( data[ field ] ) user[ field ] = data[ field ];
		}

		next( null, user );
	} );
}


/**
 * GET /api/user/:username
 *
 * @return all information about the user :username in the system.
 */
exports.readUser = function( req, res ) {
	var user = req.params.username;

	safe( res, function() {
		users.findOne( { user: user }, function( findOneError, result ) {
			error( findOneError, res );
			delete result._id;
			res.status( 200 ).json( result );
		} );
	} );
};


/**
 * PUT /api/user/:username
 *
 * updates an existing user, fails if the user is not existing. an intersection
 * of the master data fields and the data specified in the request body is merged
 * with the existing user. conflicts are solved by overriding the existing values.
 *
 * @return the url to GET the new information. usually /api/user/:username.
 */
exports.updateUser = function( req, res ) {
	todo( res );
};


/**
 * DELETE /api/user/:username
 *
 * deletes an existing user, fails if the user is not existing.
 *
 * @return the url to the list of usernames, probably /api/user.
 */
exports.deleteUser = function( req, res ) {
	var user = req.params.username;

	safe( res, function() {
		users.remove( { user: user }, function( removeError, result ) {
			error( removeError, res );
			res.send( 200, req.path.substring( 0, req.path.lastIndexOf( '/' ) ) );
		} );
	} );
};


// ===== master data management =========================================================


exports.readMasterDataSets = function( req, res ) {
	safe( res, function() {
		master.find().toArray( function( toArrayError, result ) {
			var dataSets = [];
			error( toArrayError, res );

			for ( var i = 0; i < result.length; i++ ) {
				dataSets.push( result[ i ].data );
			}

			res.status( 200 ).json( dataSets );
		} );
	} );
};


exports.createMasterData = function( req, res ) {
	todo( res );
};


exports.readMasterData = function( req, res ) {
	safe( res, function() {
		master.findOne( { data: req.params.data }, function( findOneError, result ) {
			error( findOneError, res );
			res.status( 200 ).json( result.fields );
		} );
	} );
};


exports.updateMasterData = function( req, res ) {
	todo( res );
};


exports.updateMasterDataField = function( req, res ) {
	safe( res, function() {
		master.update( { data: req.params.data }, { $addToSet: { fields: req.params.field } }, function( updateError, result ) {
			error( updateError, res );
			res.send( 200, req.path );
		} );
	} );
};


exports.removeMasterDataField = function( req, res ) {
	safe( res, function() {
		master.update( { data: req.params.data }, { $pull: { fields: req.params.field } }, function( updateError, result ) {
			error( updateError, res );
			res.send( 200, req.path.substring( 0, req.path.lastIndexOf( '/' ) ) );
		} );
	} );
}


exports.deleteMasterData = function( req, res ) {
	safe( res, function() {
		master.remove( { data: req.params.data }, function( removeError, result ) {
			error( removeError, res );
			res.send( 200, req.path.substring( 0, req.path.lastIndexOf( '/' ) ) );
		} );
	} );
};


function todo( res ) {
	res.send( 418, 'This method is not implemented yet. We\'re on it.' );
}