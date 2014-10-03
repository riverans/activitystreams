/*jslint node: true*/
/*global Caching*/
'use strict';

module.exports = function(req, res, next) {
    Caching.read(req.url).then(
        function(reply) {
            reply = JSON.parse(reply);

            sails.log.debug('Reply from cache: ', reply);

            if (!req.isSocket && req.get('if-none-match') && reply.etag && req.get('if-none-match') === reply.etag) {
                return res.send(304);
            };

            return res.send(reply.data);
        },
         /** If the requested URL is not cached, then forward to the controller. */
        function(err) {

            if (err === 200) {
                sails.log.debug('Not caching.');
            } else {
                sails.log.error('Cache Error');
            }

            return next();
    });
};
