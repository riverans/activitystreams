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
            'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']->(object:' + req.param('object') +')',
            'WHERE actor.aid="' + actor_id +'" AND object.aid="' + object_id + '"',
            'OPTIONAL MATCH (target {type : verb.target_type})',
            'WHERE HAS(verb.target_id) AND target.aid = verb.target_id',
            'RETURN actor,verb,object,target'
        ];
        Activity.adapter.query(q, {}, function(err, results) {
            if (err) {
                return res.json(500, { error: 'INVALID REQUEST' });
            }
            res.json(results);
            return Caching.write(req, results, 1);
        });
    },

    postSpecificActivity: function(req, res) {
        var q,
            actor = req.body.actor,
            actor_id = actor.aid,
            verb = req.body.verb,
            object = req.body.object,
            object_id = object.aid,
            target,
            target_query = [];

        if (req.body.target !== undefined) {
            target = req.body.target;
            target_query = [
                'ON CREATE SET verb.target_id = "' + target.aid + '", verb.target_type = "' + target.type + '"',
                'MERGE (target:' + target.type + ' { aid:"' + target.aid + '"})',
                'ON CREATE SET target.created = timestamp(), target.api = "' + target.api + '", target.type = "' + target.type + '"',
                'ON MATCH SET target.updated = timestamp()',
            ];
        }

        q = [
            'MERGE (actor:' + actor.type + ' { aid:"' + actor_id + '"})',
            'ON CREATE SET actor.created = timestamp(), actor.api = "' + actor.api + '", actor.type = "' + actor.type + '"',
            'ON MATCH SET actor.updated = timestamp()',
            'WITH actor',
            'MERGE (object:' + object.type + ' { aid:"' + object_id + '"})',
            'ON CREATE SET object.created = timestamp(), object.api = "' + object.api + '", object.type = "' + object.type + '"',
            'ON MATCH SET object.updated = timestamp()',
            'WITH object, actor',
            'MERGE (actor)-[verb:' + verb.type + ']->(object)',
            'ON CREATE SET verb.created = timestamp()',
            'ON MATCH SET verb.updated = timestamp()']
            .concat(target_query)
            .concat(['RETURN actor, verb, object' + (target_query.length !== 0 ? ', target' : '')]);

        Activity.adapter.query(q, {}, function(err, results) {
            if (err) {
                return res.json(500, { error: err, message: 'INVALID REQUEST'});
            }
            Activity.publishCreate({ id: actor_id, data: results[0] });
            RabbitMQ.publish(results);
            res.json(results);
            return Caching.bust(req, results);
        });
    },

    deleteSpecificActivity: function(req, res) {
        var q,
            verb = {
                "type" : req.param('verb')
            },
            actor_id = req.param('actor_id'),
            object_id = req.param('object_id');
        q = [
            'MATCH (actor:' + req.param('actor') +')-[verb:' + req.param('verb') + ']->(object:' + req.param('object') +')',
            'WHERE actor.aid="' + actor_id +'" AND object.aid="' + object_id + '"',
            'DELETE verb',
            'RETURN actor, object'
        ];

        Activity.adapter.query(q, {}, function(err, results) {
                if (err) {
                    return res.json(500, {error: 'INVALID REQUEST'});
                }
                if (!results.length) {
                    return res.json(404, {error: 'NOT FOUND'});
                }
                results[0].verb = verb;
                /** We need to update to sails 0.10.x to use publishDestroy instead of publishUpdate. */
                Activity.publishUpdate(actor_id, {data: results[0]});
                res.json(results);
                return Caching.bust(req);
            }
        );
    }
};
