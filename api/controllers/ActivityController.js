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
				'MATCH(n:' + req.param('actor') + ')',
				'RETURN n'
			];
		Actor.adapter.query(q,{}, function(err, results) {
				res.json(results);
			}
		);
	},
	getSpecificActor: function(req, res) {
		var obj = {};
		obj[req.param('actor') + '_id'] = req.param('actor_id');
		Actor.adapter.find(req.param('actor'), obj, function(err, results) {
				res.json(results);
			}
		);
	},
	getAllObjectsVerbedByActor: function(req, res) {
		var obj = {}, q, key;
		key = req.param('actor') + '_id';
		obj[key] = req.param('actor_id');
		q = [
				'MATCH (n:' + req.param('actor') +')-[r:' + req.param('verb') + ']-(x)',
				'WHERE n.' + key + '="' + obj[key] +'"',
				'RETURN x'
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
				'MATCH (n:' + req.param('actor') +')-[r:' + req.param('verb') + ']-(x:' + req.param('object') +')',
				'WHERE n.' + key + '="' + obj[key] +'"',
				'RETURN x'
			];
		Actor.adapter.query(q, {}, function(err, results) {
				res.json(results);
			}
		);
	},
	route5: function(req, res) {
		var tmp = ['route5',req.param('actor'), req.param('actor_id'), req.param('verb'), req.param('object'), req.param('object_id')];
		res.json(tmp);
	}


	// createActor: function(req, res) {
	// 	Actor.adapter.create()
	// }
};
