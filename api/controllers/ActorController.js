/**
 * ActorController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	/**
	 * Overrides for the settings in `config/controllers.js`
	 * (specific to ActorController)
	 */
	_config: {},

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
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					return res.json(err);
				}
				res.json(results);
			});
		} else {
			if (process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
				// Display debug query in console
				Activity.adapter.query(q, {});
			}
			res.json(200, {});
		}
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



	+Body

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
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					return res.json(err);
				}
				res.json(results);
			});
		} else {
			if (process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
				// Display debug query in console
				Activity.adapter.query(q, {});
			}
			res.json(200, {});
		}
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
			'MATCH (actor:' + req.param('actor') + ')-[verb:' + req.param('verb') + ']->(object)',
			'WHERE actor.' + key + '="' + obj[key] + '"',
			'RETURN actor,verb,object'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					return res.json(err);
				}
				res.json(results);
			});
		} else {
			if (process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
				// Display debug query in console
				Activity.adapter.query(q, {});
			}
			res.json(200, {});
		}
	},
	getSpecificObjectTypeVerbedByActor: function(req, res) {
		var obj = {}, q, key;
		key = req.param('actor') + '_id';
		obj[key] = req.param('actor_id');
		q = [
			'MATCH (actor:' + req.param('actor') + ')-[verb:' + req.param('verb') + ']-(object:' + req.param('object') + ')',
			'WHERE actor.' + key + '="' + obj[key] + '"',
			'RETURN actor,verb,object'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					return res.json(err);
				}
				res.json(results);
			});
		} else {
			if (process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
				// Display debug query in console
				Activity.adapter.query(q, {});
			}
			res.json(200, {});
		}
	},
	getAllActivitiesByActor: function(req, res) {
		var obj = {}, q, key;
		key = req.param('actor') + '_id';
		obj[key] = req.param('actor_id');
		q = [
			'MATCH (actor:' + req.param('actor') + ')-[verb]->(object)<-[cfverb]-(aa)',
			'WHERE actor.' + key + '="' + obj[key] + '" AND type(verb) = type(cfverb)',
			'RETURN actor, verb, object, COUNT(aa) AS verb_count'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					return res.json(err);
				}
				res.json(results);
			});
		} else {
			if (process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
				// Display debug query in console
				Activity.adapter.query(q, {});
			}
			res.json(200, {});
		}
	}

};