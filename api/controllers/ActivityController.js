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

	getSpecificActivity: function(req, res) {
		var q,
			actor_id = req.param('actor_id'),
			object_id = req.param('object_id');
		q = [
			'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']-(object:' + req.param('object') +')',
			'WHERE actor.aid="' + actor_id +'" AND object.aid="' + object_id + '"',
			'RETURN actor,verb,object'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
				if (err) { 
					// return res.json(err);
					res.json(500, { error: 'INVALID REQUEST' });
				}
					res.json(results);
				}
			);
		} else {
			if (process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
				// Display debug query in console
				Activity.adapter.query(q, {});
			}
			res.json(200, {});
		}
	},
	postSpecificActivity: function(req, res) {
		var q,
			actor = req.body.actor,
			actor_id = actor['aid'],
			verb = req.body.verb,
			object = req.body.object,
			object_id = object['aid'];
		q = [
			'MERGE (actor:' + actor.type + ' { aid:"' + actor_id + '", api:"' + actor.api + '" })',
			'ON CREATE SET actor.created = timestamp()',
			'ON MATCH SET actor.updated = timestamp()',
			'WITH actor',
			'MERGE (object:' + object.type + ' { aid:"' + object_id + '", api:"' + object.api + '" })',
			'ON CREATE SET object.created = timestamp()',
			'ON MATCH SET object.updated = timestamp()',
			'WITH object, actor',
			'MERGE (actor)-[verb:' + verb.type + ']->(object)',
			'ON CREATE SET verb.created = timestamp()',
			'ON MATCH SET verb.updated = timestamp()',
			'RETURN actor, verb, object'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
					if (err) {
						// return res.json(err);
						res.json(500, { error: 'INVALID REQUEST' });
					}
					Activity.publishCreate({ id: actor_id, data: results[0] });
					res.json(results);
				}
			);
		} else {
			if (process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
				// Display debug query in console
				Activity.adapter.query(q, {});
			}
			res.json(200, {});
		}
	},

	deleteSpecificActivity: function(req, res) {
		var q,
			actor_id = req.param('actor_id'),
			object_id = req.param('object_id');
		q = [
			'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']->(object:' + req.param('object') +')',
			'WHERE actor.aid="' + actor_id +'" AND object.aid="' + object_id + '"',
			'DELETE verb',
			'RETURN actor, object'
		];
		if (process.env.testMode === undefined) {
			Activity.adapter.query(q, {}, function(err, results) {
					if (err) {
						// return res.json(err);
						res.json(500, { error: 'INVALID REQUEST' });
					}
					Activity.publishUpdate(actor_id, {data: results[0]});
					res.json(results);
				}
			);
		} else {
			if (process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
				// Display debug query in console
				Activity.adapter.query(q, {});
			}
			res.json(200, {});
		}
	}
};
