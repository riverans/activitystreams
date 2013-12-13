/**
* ActivityController
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
	* (specific to ActivityController)
	*/
	_config: {},

	index: function(req, res) {
		Actor.adapter.query(
			[
				'MATCH (n)',
				'RETURN n'
			],{}, function(err, results) {
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
				'RETURN object'
			];
		Actor.adapter.query(q, {}, function(err, results) {
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
				'RETURN object'
			];
		Actor.adapter.query(q, {}, function(err, results) {
				res.json(results);
			}
		);
	},
	getSpecificActivity: function(req, res) {
		var obj = {}, q, key;
		key = req.param('actor') + '_id';
		obj[key] = req.param('actor_id');
		q = [
				'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']-(object:' + req.param('object') +')',
				'WHERE actor.' + key + '="' + obj[key] +'"',
				'RETURN actor,verb,object'
			];
		Actor.adapter.query(q, {}, function(err, results) {
				res.json(results);
			}
		);
	}


	// createActor: function(req, res) {
	// 	Actor.adapter.create()
	// }
};
