/**
 * ObjectController
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
	 * (specific to ObjectController)
	 */
	_config: {},

	/**
	 * Action blueprints:
	 *    `/object/getAllObjectOfType`
	 */
	getAllObjectsOfType: function(req, res) {

		var q = [
			'MATCH(object:' + req.param('object') + ')',
			'RETURN object'
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
	 * Action blueprints:
	 *    `/object/getSpecificObject`
	 */
	getSpecificObject: function(req, res) {

		var obj = {}, q, key;
		key = req.param('object') + '_id';
		obj[key] = req.param('object_id');
		q = [
			'MATCH(object:' + req.param('object') + ')',
			'WHERE object.' + key + '="' + req.param('object_id') + '"',
			'RETURN object'
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
	 * Action blueprints:
	 *    `/object/getAllActivitiesByObject`
	 */
	getAllActivitiesByObject: function(req, res) {

		var obj = {}, q, key;
		key = req.param('object') + '_id';
		obj[key] = req.param('object_id');
		q = [
			'MATCH (object:' + req.param('object') + ')<-[verb]-(actor)',
			'WHERE object.' + key + '="' + obj[key] + '"',
			'WITH type(verb) as verbType, count(actor) as actors, { actor: actor, verb: verb, object: object } as activity',
			'RETURN verbType as verb, count(actors) as totalItems, collect(activity) as items'
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
	 * Action blueprints:
	 *    `/object/getAllActorsWhoVerbedObject`
	 */
	getAllActorsWhoVerbedObject: function(req, res) {

		var obj = {}, q, key;
		key = req.param('object') + '_id';
		obj[key] = req.param('object_id');
		q = [
			'MATCH (object:' + req.param('object') + ')<-[verb:' + req.param('verb') + ']-(actor)',
			'WHERE object.' + key + '="' + obj[key] + '"',
			'WITH count(actor) as actors, { actor: actor, verb: verb, object: object } as activity',
			'RETURN count(actors) as totalItems, collect(activity) as items'
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
	 * Action blueprints:
	 *    `/object/getSpecificActorTypeWhoVerbedObject`
	 */
	getSpecificActorTypeWhoVerbedObject: function(req, res) {

		var obj = {}, q, key;
		key = req.param('object') + '_id';
		obj[key] = req.param('object_id');
		q = [
			'MATCH (object:' + req.param('object') + ')<-[verb:' + req.param('verb') + ']-(actor:' + req.param('actor') + ')',
			'WHERE object.' + key + '="' + obj[key] + '"',
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
	}
};