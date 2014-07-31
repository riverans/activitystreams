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
	###### Actor [GET][/actor/{appname_model}]
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
	+ appname_model (string) where appname is the name of the app, and model is the name of the model we are dealing with

	+ Model (application/json)

	JSON representation of an actor node

	+ Example
		[
			{
				actor: {
					id: "17",
					data: {
						created: 1388691303471,
						appname_model_id: "1",
						updated: 1388789935187,
						appname_model_api: "http://reallycool.api.url/path/1",
						type: "appname_model",
					},
				},
			},
			{
				actor: {
					id: "22",
					data: {
						created: 1388691303471,
						appname_model_id: "2",
						updated: 1388789935187,
						appname_model_api: "http://reallycool.api.url/path/2",
						type: "appname_model",
					},
				},
			},
		]
	*/

	getAllActorsOfType: function(req, res) {
		var q = [
			'MATCH (actor:' + req.param('actor') + ')',
			'RETURN actor'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					// return res.json(err); debug
					res.json(500, { error: 'INVALID REQUEST' });
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
	###### Actor [GET][/actor/{appname_model}/{appname_model_id}]
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
	+ appname_model (string) where appname is the name of the app, and model is the name of the model we are dealing with
	+ appname_model_id (integer) a number that matches an appropriate id from another applications model

	+ Model (application/json)

	JSON representation of an actor node

	+ Example
		[
			{
				actor: {
					id: "17",
					data: {
						created: 1388691303471,
						appname_model_id: "1",
						updated: 1388789935187,
						appname_model_api: "http://reallycool.api.url/path/1/",
						type: "appname_model",
					},
				},
			},
		]
	*/

	getSpecificActor: function(req, res) {
		var obj = {}, q;
		q = [
			'MATCH (actor:' + req.param('actor') + ')',
			'WHERE actor.aid="' + req.param('actor_id') + '"',
			'RETURN actor'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					// return res.json(err);
					res.json(500, { error: 'INVALID REQUEST' });
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
	 * Delete Specific Actor from graph
	 * @param  {String} appname_model [The type of actor you want to delete]
	 * @param  {String} id [The id of the actor you want to delete]
	 * @return {HTML} 200, 500 [200 OK if the deletion worked, and 500 if there was an error]
	 */
	deleteSpecificActor: function(req, res) {
		var obj = {}, q;
		q = [
			'MATCH (actor:' + req.param('actor') + ')-[v]-()',
			'WHERE actor.aid="' + req.param('actor_id') + '"',
			'DELETE actor, v'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					// return res.json(err);
					res.json(500, { error: 'INVALID REQUEST' });
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
	###### Actor [GET][/actor/{appname_model}/{appname_model_id}/{verb}]
	This endpoint will return activities in the db that match the actor and specific verb specified in the params, along with
	a count of the number of activities for this specific verb.

	Actor:

	- id (this id is assigned by Neo4j and should not be used)

	And within the data property:

	- created: _Timestamp_
	- updated (optional): _Timestamp_
	- appname_model_id: _Integer/String_
	- appname_model_api: _URL_
	- type: {appname_model}

	+ Parameters
	+ appname_model (string) where appname is the name of the app, and model is the name of the model we are dealing with
	+ appname_model_id (integer) a number that matches an appropriate id from another applications model
	+ verb (string) where verb is the name of a valid activity type attached to that user

	+ Model (application/json)

	JSON representation of an actor node

	+ Example
	{
		itemsCount: 2,
		items: [
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
						resource_type_api: "http://reallycool.api.url/path/14055",
						created: 1388692564273,
						resource_type_id: "14055",
						updated: 1388777568757,
						type: "resource_type"
					},
				},
			},
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
				},
				verb: {
					id: "50",
					data: {
						created: 1388777568757
					},
					type: "FAVORITED",
					start: "17",
					end: "19"
				},
				object: {
					id: "19",
					data: {
						resource_type_api: "http://reallycool.api.url/path/16225",
						created: 1388692564273,
						resource_type_id: "16225",
						updated: 1388777568757,
						type: "resource_type"
					},
				},
			},
		]
	}
	*/

	getAllObjectsVerbedByActor: function(req, res) {
		var obj = {}, q;
		q = [
			'MATCH (actor:' + req.param('actor') + ')-[verb:' + req.param('verb') + ']->(object)',
			'WHERE actor.aid="' + req.param('actor_id') + '"',
			'WITH collect(object) as objectCollection, { actor: actor, verb: verb, object: object } as activity',
			'RETURN count(objectCollection) as totalItems, collect(activity) as items'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					// return res.json(err);
					res.json(500, { error: 'INVALID REQUEST' });
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
		var obj = {}, q;
		q = [
			'MATCH (actor:' + req.param('actor') + ')-[verb:' + req.param('verb') + ']-(object:' + req.param('object') + ')',
			'WHERE actor.aid="' + req.param('actor_id') + '"',
			'RETURN actor, verb, object'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					// return res.json(err);
					res.json(500, { error: 'INVALID REQUEST' });
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
	###### Actor [GET][/actor/{appname_model}/{appname_model_id}/activities]
	This endpoint will return all activities in the db that match the actor specified in the params, along with
	a count of the number of activities for this specific actor.

	Actor:

	- id (this id is assigned by Neo4j and should not be used)

	And within the data property:

	- created: _Timestamp_
	- updated (optional): _Timestamp_
	- appname_model_id: _Integer/String_
	- appname_model_api: _URL_
	- type: {appname_model}

	+ Parameters
	+ appname_model (string) where appname is the name of the app, and model is the name of the model we are dealing with
	+ appname_model_id (integer) a number that matches an appropriate id from another applications model

	+ Model (application/json)

	JSON representation of an actor node

	+ Example
	{
		{
			verb: 'FAVORITED',
			totalItems: 1,
			items: {
				0: {
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							appname_model_id: "1",
							updated: 1388789935187,
							appname_model_api: "http://reallycool.api.url/path/1/",
							type: "appname_model"
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
							resource_type_api: "http://reallycool.api.url/path/14055",
							created: 1388692564273,
							resource_type_id: "14055",
							updated: 1388777568757,
							type: "resource_type"
						},
					},
				},
		}
		{
			type: 'WATCHED',
			totalItems: 1,
			items: {
					actor: {
						id: "17",
						data: {
							created: 1388691303471,
							appname_model_id: "1",
							updated: 1388789935187,
							appname_model_api: "http://reallycool.api.url/path/1/",
							type: "appname_model"
						}
					},
					verb: {
						id: "52",
						data: {
							created: 1388777568757
						},
						type: "WATCHED",
						start: "17",
						end: "22"
					},
					object: {
						id: "22",
						data: {
							resource_type_api: "http://reallycool.api.url/path/58442",
							created: 1388692564273,
							resource_type_id: "58442",
							updated: 1388777568757,
							type: "resource_type"
						},
					},
				},
			}
		]
	}
	*/
	
	getAllActivitiesByActor: function(req, res) {
		var obj = {}, q;
		q = [
			'MATCH (actor:' + req.param('actor') + ')-[verb]->(object)',
			'WHERE actor.aid="' + req.param('actor_id') + '"',
			'WITH type(verb) as verbType, collect(object) as objectCollection, { actor: actor, verb: verb, object: object } as activity',
			'RETURN verbType as verb, count(objectCollection) as totalItems, collect(activity) as items'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) {
					// return res.json(err);
					res.json(500, { error: 'INVALID REQUEST' });
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