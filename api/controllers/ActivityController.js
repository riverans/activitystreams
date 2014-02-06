/**
* ActivityController
*
* @module      :: Controller
*/

module.exports = {




	/**
	* Overrides for the settings in `config/controllers.js`
	* (specific to ActivityController)
	*/
	_config: {},

	/**
	* Generic Functions 
	**/

	/**
	###### Establish Session Cookie [GET][/]

	Sets an authenticated session cookie if the client does not already have one,
	Existing valid sessions are reestablished.  Only necessary when you need to
	establish a socket connection.

	Making an empty JSONP call to this endpoint before establishing your socket
	connection is necessary for clients on 3rd party domains.  Otherwise session
	auth will fail, as the AS service will try to use a cookie of 'undefined'
	during authentication.

	Example client call using jQuery:
	$.ajax({
		url: 'as.nationalgeographic.com',
		dataType: 'jsonp',
		complete: function() {
			// Establish socket connection
		}
	});

	**/
	setCookie: function(req, res) {
		res.send({});
	},

	/**
	###### Retrieve Entry Point [GET][/api/v1/]

	Returns all nodes in the graph (To be deprecated and switched to an api navigator).

	+ Response 200 (application/json)
		+ Headers

				

		+ Body

				{
					[]
				}

	*/
	index: function(req, res) {
		Actor.adapter.query(
			[
				'MATCH (n)',
				'RETURN n'
			],{}, function(err, results) {
				if (err) { return res.json(err); }
				res.json(results);
			}
		);
	},
	/**
	###### Actor [GET][/{appname_model}]
	An activity is always started by an Actor. The endpoint will return all nodes in the db that fit the appname_model label, represented as an actor.

	All actors have the following data:

	- id (this id is assigned by Neo4j and should not be used)

	And within the data property:

	- created: _Timestamp_
	- updated (optional): _Timestamp_
	- appname_model_id: _Integer/String_
	- appname_model_api: _URL_
	- type: {appname_model}

	+ Parameters
		+ appname_model (string) where appname is the name of the app, and model is the name of the model we are dealing with (eg. mmdb_user or ngm_article)

	+ Model (application/json)

		JSON representation of an actor node

		+ Headers

			

		+ Body

				{
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							appname_model_id: "1",
							updated: 1388789935187,
							appname_model_api: "http://reallycool.api.url/path/1/",
							type: "appname_model"
						}
					}
				}

				{
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							appname_model_id: "1",
							updated: 1388789935187,
							appname_model_api: "http://reallycool.api.url/path/1/",
							type: "appname_model"
						}
					}
				}

		+ Example

				{
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							mmdb_user_id: "1",
							updated: 1388789935187,
							mmdb_user_api: "https://mmdb.nationalgeographic.com/user/1",
							type: "mmdb_user"
						}
					}
				}
	*/

	getAllActorsOfType: function(req, res) {
		var q = [
				'MATCH(actor:' + req.param('actor') + ')',
				'RETURN actor'
			];
		Actor.adapter.query(q,{}, function(err, results) {
				if (err) { return res.json(err); }
				res.json(results);
			}
		);
	},

	/**
	###### Actor [GET][/{appname_model}/{appname_model_id}]
	An activity is always started by an Actor. This endpoint will return the node representing an actor of specific id.

	All actors have the following data:

	- id (this id is assigned by Neo4j and should not be used)

	And within the data property:

	- created: _Timestamp_
	- updated (optional): _Timestamp_
	- appname_model_id: _Integer/String_
	- appname_model_api: _URL_
	- type: {appname_model}

	+ Parameters
		+ appname_model (string) where appname is the name of the app, and model is the name of the model we are dealing with (eg. mmdb_user or ngm_article)
		+ appname_model_id (integer) a number that matches an appropriate id from another applications model

	+ Model (application/json)

		JSON representation of an actor node

		+ Headers

			

		+ Body

				{
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							appname_model_id: "1",
							updated: 1388789935187,
							appname_model_api: "http://reallycool.api.url/path/1/",
							type: "appname_model"
						}
					}
				}

		+ Example

				{
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							mmdb_user_id: "1",
							updated: 1388789935187,
							mmdb_user_api: "https://mmdb.nationalgeographic.com/user/1",
							type: "mmdb_user"
						}
					}
				}
	*/
	getSpecificActor: function(req, res) {
		var obj = {}, q, key;
		key = req.param('actor') + '_id';
		obj[key] = req.param('actor_id');
		q = [
			'MATCH(actor:' + req.param('actor') + ')',
			'WHERE actor.' + key + '="' + req.param('actor_id') + '"',
			'RETURN actor'
		];
		Actor.adapter.query(q, {}, function(err, results) {
				if (err) { return res.json(err); }
				res.json(results);
			}
		);
	},
	/**
	###### Actor [GET][/{appname_model}/{appname_model_id}/{verb}]
	This endpoint will return activities in the db that match the actor and specific verb specified in the params.

	Activity:

	- id (this id is assigned by Neo4j and should not be used)

	And within the data property:

	- created: _Timestamp_
	- updated (optional): _Timestamp_
	- appname_model_id: _Integer/String_
	- appname_model_api: _URL_
	- type: {appname_model}

	+ Parameters
		+ appname_model (string) where appname is the name of the app, and model is the name of the model we are dealing with (eg. mmdb_user or ngm_article)
		+ appname_model_id (integer) a number that matches an appropriate id from another applications model
		+ verb (string) where verb is the name of a valid activity type attached to that user

	+ Model (application/json)

		JSON representation of an actor node

		+ Headers

			

		+ Body

				{
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							mmdb_user_id: "1",
							updated: 1388789935187,
							mmdb_user_api: "https://mmdb.nationalgeographic.com/user/1/",
							type: "mmdb_user"
						}
					},
					verb: {
						id: "50",
						data: {
							created: 1388777568757
						},
						type: "FAVORITED",
						start: "17",
						end: "18"
					},
					object: {
						id: "18",
						data: {
							yourshot_photo_api: "http://yourshot.nationalgeographic.com/api/v1/photo/14055",
							created: 1388692564273,
							yourshot_photo_id: "14055",
							updated: 1388777568757,
							type: "yourshot_photo"
						}
					}
				}

		+ Example

				{
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							mmdb_user_id: "1",
							updated: 1388789935187,
							mmdb_user_api: "https://mmdb.nationalgeographic.com/user/1/",
							type: "mmdb_user"
						}
					},
					verb: {
						id: "50",
						data: {
							created: 1388777568757
						},
						type: "FAVORITED",
						start: "17",
						end: "18"
					},
					object: {
						id: "18",
						data: {
							yourshot_photo_api: "http://yourshot.nationalgeographic.com/api/v1/photo/14055",
							created: 1388692564273,
							yourshot_photo_id: "14055",
							updated: 1388777568757,
							type: "yourshot_photo"
						}
					}
				}
	*/
	getAllObjectsVerbedByActor: function(req, res) {
		var obj = {}, q, key;
		key = req.param('actor') + '_id';
		obj[key] = req.param('actor_id');
		q = [
				'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']-(object)',
				'WHERE actor.' + key + '="' + obj[key] +'"',
				'RETURN actor,verb,object'
			];
		Actor.adapter.query(q, {}, function(err, results) {
				if (err) { return res.json(err); }
				res.json(results);
			}
		);
	},
	getSpecificObjectTypeVerbedByActor: function(req, res) {
		var obj = {}, q, key;
		key = req.param('actor') + '_id';
		obj[key] = req.param('actor_id');
		q = [
				'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']-(object:' + req.param('object') +')',
				'WHERE actor.' + key + '="' + obj[key] +'"',
				'RETURN actor,verb,object'
			];
		Actor.adapter.query(q, {}, function(err, results) {
				if (err) { return res.json(err); }
				res.json(results);
			}
		);
	},
	getSpecificActivity: function(req, res) {
		var q,
			actor_key = req.param('actor') + '_id',
			actor_id = req.param('actor_id'),
			object_key = req.param('object') + '_id',
			object_id = req.param('object_id');
		q = [
				'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']-(object:' + req.param('object') +')',
				'WHERE actor.' + actor_key + '="' + actor_id +'" AND object.' + object_key + '="' + object_id + '"',
				'RETURN actor,verb,object'
			];
		Actor.adapter.query(q, {}, function(err, results) {
				if (err) { return res.json(err); }
				res.json(results);
			}
		);
	},
	getAllActivitiesByActor: function(req, res) {
		var obj = {}, q, key;
		key = req.param('actor') + '_id';
		obj[key] = req.param('actor_id');
		q = [
				'MATCH (actor:' + req.param('actor') +')-[verb]-(object)',
				'WHERE actor.' + key + '="' + obj[key] +'"',
				'RETURN actor,verb,object'
			];
		Actor.adapter.query(q, {}, function(err, results) {
				if (err) { return res.json(err); }
				res.json(results);
			}
		);
	},

	postSpecificActivity: function(req, res) {
		var q,
			actor = req.body.actor,
			actor_key = actor.type + '_id',
			actor_id = actor[actor_key],
			verb = req.body.verb,
			object = req.body.object,
			object_key = object.type + '_id',
			object_id = object[object_key];
		q = [
			'MERGE (actor:' + actor.type + ' { ' + actor_key + ':"' + actor_id + '", type:"' + actor.type + '", ' + actor.type + '_api:"' + actor.api + '" })',
			'ON CREATE SET actor.created = timestamp()',
			'ON MATCH SET actor.updated = timestamp()',
			'WITH actor',
			'MERGE (object:' + object.type + ' { ' + object_key + ':"' + object_id + '", type:"' + object.type + '",  ' + object.type + '_api:"' + object.api + '" })',
			'ON CREATE SET object.created = timestamp()',
			'ON MATCH SET object.updated = timestamp()',
			'WITH object, actor',
			'MERGE (actor)-[verb:' + verb.type + ']->(object)',
			'ON CREATE SET verb.created = timestamp()',
			'ON MATCH SET verb.updated = timestamp()',
			'RETURN actor, verb, object'
		];
		Actor.adapter.query(q, {}, function(err, results) {
				if (err) { return res.json(err); }
				Actor.publishCreate({id: actor_id, data: results[0]});
				res.json(results);
			}
		);
	},

	deleteSpecificActivity: function(req, res) {
		var q,
			actor_key = req.param('actor') + '_id',
			actor_id = req.param('actor_id'),
			object_key = req.param('object') + '_id',
			object_id = req.param('object_id');
		q = [
			'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']-(object:' + req.param('object') +')',
			'WHERE actor.' + actor_key + '="' + actor_id +'" AND object.' + object_key + '="' + object_id + '"',
			'DELETE verb',
			'RETURN actor, object'
		];
		Actor.adapter.query(q, {}, function(err, results) {
				if (err) { return res.json(err); }
				Actor.publishUpdate(actor_id, {data: results[0]});
				res.json(results);
			}
		);
	},

	subscribe: function(req, res) {
		var id = [];
		id.push(req.param('user'));
		Actor.subscribe(req.socket);
		Actor.subscribe(req.socket, id);
		res.send(200);
	}
};
