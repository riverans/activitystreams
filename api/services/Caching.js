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

        /** Attempt to get the requested data and execute the supplied callback. */
        return client.get(url, function(err, reply) {
            if (err) {
                console.log(err);
            }
            return callback(err, reply);
        });
    },
    /**
     * Write a response to the cache and invalidate necessary fields.
     * @param {string} url The url for the request.
     * @param {object} data The response that should be saved in the cache.
     * @param {integer} depth The depth of the members that should be used for the new key.
     * Depth = 1: actor_type/aid.VERB.object_type/aid
     * Depth = 2: actor_type/aid.VERB.object_type
     * Depth = 3: actor_type/aid.VERB
     * Depth = 4: actor_type/aid
     * Depth = 5: actor_type
     */
    write: function(url, data, depth) {
        var cacheHash = {
                data: data,
                /** Generate a proper ETag for the data. */
                etag: crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
            },
            bustMembers = {},
            writeMembers = {},
            activity,
            multi = client.multi();

        /** Normalize the url. */
        url = (url.substr(-1) !== '/') ? url + '/' : url;

        /** Select keyspace with routes as primary keys. */
        client.select(1);
        /** Write the data. */
        client.set(url, JSON.stringify(cacheHash));

        /** Select keyspace with members as primary keys. */
        client.select(2);

        /** Invalidate the old data. */
        /** Generate the list of members to invalidate old data and save new data. */
        for (var i = 0; i < data.length; i++) {
            for (var key in data[i].items) {
                if (data[i].items.hasOwnProperty(key)) {
                    activity = data[i].items[key];
                    bustMembers[activity.actor.data.type] = true;
                    if (depth > 4) writeMembers[activity.actor.data.type] = true;

                    bustMembers[activity.actor.data.type + '/' + activity.actor.data.aid] = true;
                    if (depth > 3) writeMembers[activity.actor.data.type + '/' + activity.actor.data.aid] = true;

                    bustMembers[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.type] = true;
                    if (depth > 2) writeMembers[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.type] = true;

                    bustMembers[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.type + '.' + activity.object.data.type] = true;
                    if (depth > 1) writeMembers[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.type + '.' + activity.object.data.type] = true;

                    bustMembers[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.type + '.' + activity.object.data.type + '/' + activity.object.data.aid] = true;
                    if (depth > 0) writeMembers[activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.type + '.' + activity.object.data.type + '/' + activity.object.data.aid] = true;
                }
            }
        }
        bustMembers = Object.keys(bustMembers).sort();
        writeMembers = Object.keys(writeMembers).sort().join(';') + ';';

        /** Queue up the reads and deletes. */
        bustMembers.forEach(function(bustMember) {
            multi.keys('*' + bustMember + ';*', function(err, replies) {
                replies.forEach(function(reply) {
                    multi.del(reply);
                });
            });
        });
        /** Queue up the write. */
        multi.set(writeMembers, url);
        /** Run the queue. */
        multi.exec();

        return data;
    }
};
