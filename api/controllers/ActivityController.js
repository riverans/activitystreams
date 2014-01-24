/**
*
* @module ActivityController
*
*/
#
# @description A set of functions defining the Activity Stream API.
#
#  Actions contain code telling Sails how to respond to a certain type of request.
#  (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
#
#  You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
#  and/or override them with custom routes (`config/routes.js`)
#
#  NOTE: The code you write here supports both HTTP and Socket.io automatically.
#
#  see http://sailsjs.org/#!documentation/controllers
#

module.exports = {

/** * Sets a cookie given a value of any type.
 * * @method set
 * @public 
 * @param {String} name The name of the cookie to be set 
 * @param {Mixed} value The value to convert to string and set in the cookie 
 * @param {Object} [options] Options hash 
 * @param {Mixed} [options.expires] The expiration as a number of seconds, or "session", or undefined for one year 
 * @return {Boolean} Whether or not the cookie was successfully set 
 * 
 * @example 
 * cookie.set('foo', 'bar', { expires : 1000000 }); 
 * cookie.set('foo', [1, 2, 3], { expires : 'session' }); 
 * cookie.set('foo', { bar : 'baz', boom : 'boosh' }); 
 */


	/**
	* Overrides for the settings in `config/controllers.js`
	* (specific to ActivityController)
	*/
	_config: {},

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
				Actor.publishUpdate(actor_id, results[0]);
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
