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
     * Write a response to the cache.
     * @param {string} url The url for the request.
     * @param {object} data The response that should be saved in the cache.
     * @param {integer} depth The depth of the members that should be used for the new key.
     * @return {array} The data that was written.
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
            members = this._generateMembers(data, depth);

        /** Normalize the url. */
        url = (url.substr(-1) !== '/') ? url + '/' : url;

        /** Select keyspace with routes as primary keys. */
        client.select(1);
        /** Write the data. */
        client.set(url, JSON.stringify(cacheHash));

        /** Select keyspace with members as primary keys. */
        client.select(2);
        /** Run up the write. */
        client.set(members.writeMembers, url);

        return data;
    },

    /**
     * Bust a cached response and invalidate necessary fields.
     * @param {object} activities The activities that should be busted.
     * @param {integer} depth The depth of the members that should be used for the new key.
     * @return {boolean} False.
     * Depth = 1: actor_type/aid.VERB.object_type/aid
     * Depth = 2: actor_type/aid.VERB.object_type
     * Depth = 3: actor_type/aid.VERB
     * Depth = 4: actor_type/aid
     * Depth = 5: actor_type
     */
    bust: function(data, depth) {
        var multi = client.multi(),
            members = this._generateMembers(data, depth);

        /** Select keyspace with members as primary keys. */
        client.select(2);

        /** Queue up the reads and deletes. */
        members.bustMembers.forEach(function(bustMember) {
            multi.keys('*' + bustMember + ';*', function(err, replies) {
                replies.forEach(function(reply) {
                    multi.del(reply);
                });
            });
        });

        /** Run the queue. */
        multi.exec();

        return false;
    },

    /**
     * Generate the list of members to use for writing and busting.
     * @param {object} activities The activities used to generate members.
     * @param {integer} depth The depth of the members that should be used for the new key.
     * @return {object} An object containing members suitable for both writing and caching.
     * Depth = 1: actor_type/aid.VERB.object_type/aid
     * Depth = 2: actor_type/aid.VERB.object_type
     * Depth = 3: actor_type/aid.VERB
     * Depth = 4: actor_type/aid
     * Depth = 5: actor_type
     */
    _generateMembers: function(data, depth) {
        var bustMembers = {},
            writeMembers = {},
            activity;

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

        return {bustMembers: bustMembers, writeMembers: writeMembers};
    }
};
