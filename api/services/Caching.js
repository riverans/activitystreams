/*jslint node: true */
'use strict';

var redis = require('redis'),
    client = redis.createClient(),
    crypto = require('crypto');

client.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});

module.exports = {

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
     * @param {object} req The request object.
     * @param {object} data The response that should be saved in the cache.
     * @param {integer} depth The depth of the members that should be used for the new key.
     * @param [string] custom A custom string to use for cache-busting.
     * @return {array} The data that was written.
     * Depth = 1: actor_type/aid.VERB.object_type/aid
     * Depth = 2: actor_type/aid.VERB.object_type/ actor_type/.VERB.object_type/aid
     * Depth = 3: actor_type/aid.VERB. .VERB.object_type/aid
     * Depth = 4: actor_type/aid. .object_type/aid
     * Depth = 5: actor_type/ .object_type
     */
    write: function(req, data, depth, custom) {
        var cacheHash = {
                data: data,
                /** Generate a proper ETag for the data. */
                etag: crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
            },
            /** Normalize the url. */
            url = (req.url.substr(-1) !== '/') ? req.url + '/' : req.url,
            /** Create an options hash to be used for member generation. */
            options = {
                /**
                 * If the data is empty, then we need to generate some data
                 * from the params only for member generation, not for caching,
                 */
                data: data.length ? data : this._generateDataFromReq(req),
                depth: depth,
                /**
                 * If we are writing form the point of view of an object then
                 * the members need to look a little different.
                 */
                inverted: req.route.path.indexOf('/api/v1/object') === 0 ? true : false,
                req: req,
                custom: custom
            },
            members = this._generateMembers(options);

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
     * @param {object} req The request object.
     * @param {object} activities The activities that should be busted.
     * @return {boolean} False.
     */
    bust: function(req, data) {
        var bustMember,
            members = {},
            multi = client.multi(),
            noun;

        data = data.length ? data : this._generateDataFromReq(req);

        /** Select keyspace with members as primary keys. */
        client.select(2);

        /**
         * If we are deleting a node then we will not have a verb. Bust anything
         * mathing *type/aid.*
         */
        if (!data[0].verb) {
            noun = data[0].actor ? 'actor' : 'object';
            bustMember = data[0][noun].data.type + '/' + data[0][noun].data.aid + '.';
            /** Queue up the reads and deletes. */
            multi.keys('*[;.]' + bustMember + '[;.]*', function(err, replies) {
                replies.forEach(function(reply) {
                    multi.del(reply);
                });
            });
        } else {
            members = this._generateMembers({data: data});
            /** Queue up the reads and deletes. */
            members.bustMembers.forEach(function(bustMember) {
                multi.keys('*;' + bustMember + ';*', function(err, replies) {
                    replies.forEach(function(reply) {
                        multi.del(reply);
                    });
                });
            });
        }

        /** Run the queue. */
        multi.exec();

        return false;
    },

    /**
     * Generate the list of members to use for writing and busting.
     * @param {object} options A hash of options to generate members including:
     * data, depth, and inverted.
     * @return {object} An object containing members suitable for both writing
     * to and busting the cache.
     */
    _generateMembers: function(options) {
        var bustMembers = {},
            writeMembers = {},
            activity,
            custom = options.custom,
            data = options.data,
            depth = options.depth || 1,
            inverted = options.inverted || false,
            member,
            req = options.req;

        /** Generate the list of members to invalidate old data and save new data. */
        for (var i = 0; i < data.length; i++) {
            activity = data[i];

            /** Depth 5: .object_type actor_type/ */
            member = inverted ? '.' + activity.object.data.type : activity.actor.data.type + '/';
            bustMembers[member] = true;
            if (depth > 4) writeMembers[member] = true;

            /** Depth 4: .object_type/aid actor_type/aid. */
            if ((inverted && activity.object.data.aid) || (!inverted && activity.actor.data.aid)) {
                member = inverted ? member + '/' + activity.object.data.aid : member + activity.actor.data.aid + '.';
                bustMembers[member] = true;
                if (depth > 3) writeMembers[member] = true;

                /**
                * Some of our routes and requests are special in that they do not
                * return activities and instead only return information about
                * nodes. These need to be treated specially.
                */
                if (activity.verb) {
                    /** Depth 3: .VERB.object_type/aid actor_type/aid.VERB. */
                    member = inverted ? '.' + activity.verb.type + member : member + activity.verb.type + '.';
                    bustMembers[member] = true;
                    if (depth > 2) writeMembers[member] = true;

                    if ((inverted && activity.actor) || (!inverted && activity.object)) {
                        /** Depth 2: actor_type/.VERB.object_type/aid actor_type/aid.VERB.object_type/ */
                        member = inverted ? activity.actor.data.type + '/' + member : member + activity.object.data.type + '/';
                        bustMembers[member] = true;
                        if (depth > 1) writeMembers[member] = true;

                        /**
                        * If we try to get a specific activity that does not exist
                        * then the activities object/activity will not have an
                        * aid.
                        */
                        if ((inverted && activity.actor.data.aid) || (!inverted && activity.object.data.aid)) {
                            /** Depth 1: actor_type/aid.VERB.object_type/aid */
                            member = activity.actor.data.type + '/' + activity.actor.data.aid + '.' + activity.verb.type + '.' + activity.object.data.type + '/' + activity.object.data.aid;
                            bustMembers[member] = true;
                            if (depth > 0) writeMembers[member] = true;
                        }
                    }
                }
            }
        }
        /** Sort members in reverse order since lower depths bust more items. */
        bustMembers = Object.keys(bustMembers).sort().reverse();
        writeMembers = ';' + Object.keys(writeMembers).sort().reverse().join(';') + ';';
        /**
         * For proxy queries, such as: get all activities of people I follow,
         * we need to be able to bust cache not only when the object or proxy
         * changes, but also when the base actor changes. Since this actor is
         * not in the activities, we need to manually add it using a custom
         * string.
         */
        writeMembers += custom ? custom + ';' : '';
        /**
         * We need this flag to deal with ambiguity in member creation to
         * ensure routes like '/api/v1/actor/:actor/:actor_id' and
         * '/api/v1/actor/:actor/:actor_id/activities' do not get the same
         * exact members or one's pointer would overwrite the other's and make
         * cache busting unpredictable.
         */
       writeMembers += req.route.path;

        return {bustMembers: bustMembers, writeMembers: writeMembers};
    },

    /**
     * Some requests do not return data, such as GET requests for non existant
     * data and DELETE requests, so we need to create a processable activity or
     * node from the request parameters.
     * @param {object} req The request object.
     * @return {array} An array of length 1 with the generated activity or
     * node.
     */
    _generateDataFromReq: function(req) {
        var data = {};
        if (req.param('actor')) {
            data.actor = {
                data: {
                    aid: req.param('actor_id'),
                    type: req.param('actor')
                }
            };
        }

        if (req.param('object')) {
            data.object = {
                data: {
                    aid: req.param('object_id'),
                    type: req.param('object')
                }
            };
        }

        if (req.param('verb')) {
            data.verb = {
                type: req.param('verb')
            };
        }

        return [data];
    }
};
