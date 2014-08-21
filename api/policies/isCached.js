/*jslint node: true*/
/*global Caching*/
'use strict';

module.exports = function(req, res, next) {
    /** Standardize all urls to have a trailing slash. */
    var url = (req.url.substr(-1) !== '/') ? req.url + '/' : req.url;

    Caching.read(url, function(err, reply) {
        if (reply) {
            reply = JSON.parse(reply);
            if (req.get('if-none-match') && reply.etag && req.get('if-none-match') === reply.etag) {
                return 304;
            }
            return res.send(reply.data);
        }
        return next();
    });
};
