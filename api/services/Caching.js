/*jslint node: true */
'use strict';

var redis = require('redis'),
    client = redis.createClient(),
    crypto = require('crypto');

client.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});

module.exports = {

    delete: function(data) {

    },
    read: function(url, callback) {
        /** Select keyspace with routes as primary keys. */
        client.select(1);

        console.log(url);
        /** Attempt to get the requested data and execute the supplied callback. */
        return client.get(url, function(err, reply) {
            if (err) {
                console.log(err);
            }
            console.log(reply);
            return callback(err, reply);
        });
    },
    /**
     * Write a response to the cache and invalidate necessary fields.
     * @param {object} req The request object.
     * @param {object} data The response that should be saved in the cache.
     */
    write: function(req, data) {
        var cacheHash = {
                data: data,
                /** Generate a proper ETag for the data. */
                etag: crypto.createHash('md5').update(data).digest('hex')
            },
            url = (req.url.substr(-1) !== '/') ? req.url + '/' : req.url,
            members = {};

        /** Select keyspace with memebrs as primary keys. */
        client.select(2);

        /** Actually write the data. */
        client.set(url, JSON.stringify(cacheHash));

        /** Invalidate the old data. */
        for (var i = 0; i < data.length; i++) {
            for (var activity in data[i].items) {
                if (data[i].items.hasOwnProperty(activity)) {
                    members[activity.actor.data.type] = true;
                    members[activity.actor.data.type + '/' + activity.actor.data.aid] = true;
                    members[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.data.type] = true;
                    members[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.data.type + '.' + activity.object.data.type] = true;
                    members[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.data.type + '.' + activity.object.data.type + '/' + activity.object.data.aid] = true;
                }
            }
        }
    }
};
