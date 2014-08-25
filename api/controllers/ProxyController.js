/**
 * ProxyController.js 
 *
 * @description ::
 * @docs                :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
        
    getProxyActivities: function(req, res) {
        var obj = {}, q;
        q = [
            'MATCH (a:' + req.param('actor') + ')-[v]->(proxy)-[verb]->(object)',
            'WHERE a.aid="' + req.param('actor_id') + '"',
            'AND NOT a.aid=proxy.aid',
            'AND NOT object.type=proxy.type',
            'WITH type(verb) as verbType, collect(object) as objectCollection, { actor: proxy, verb: verb, object: object } as activity',
            'RETURN verbType as verb, count(objectCollection) as totalItems, collect(activity) as items'
        ];

        Proxy.adapter.query(q, {}, function(err, results) {
            if (err) { console.log(err); }
            res.json(results);
            // Write to the cache and use a custom string.
            Caching.write(req, results, 1, req.param('actor') + '/' + req.param('actor_id'));
        });
    }

};
