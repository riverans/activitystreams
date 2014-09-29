/*jslint node: true*/
/*global Caching*/
'use strict';

module.exports = function(req, res, next) {
    sails.log("Req:", req.headers);
    Caching.read(req.url).then(
        function(reply) {
            sails.log("Reading from cache.");
             reply = JSON.parse(reply);
             if (!req.isSocket && req.get('if-none-match') && reply.etag && req.get('if-none-match') === reply.etag) {
                 return res.send(304);
             }
             return res.send(reply.data);
        },
         /** If the requested URL is not cached, then forward to the controller. */
        function(err) {
             sails.log("Not cached.");
            if (err === 500) {
                sails.log("Redis is down.", err);
                sails.config.cacheActive = false;
            };
           //
           // console.log(err);
            return next();
    });
};
