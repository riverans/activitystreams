/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
var request = require('request');
var https = require('https');
var util = require('util');

module.exports = function(req, res, next) {
    /**
     * This is the generic Auth policy function that well take session Cookie and an endpoint
     * and will send each requset to the endpoint to authentication
     * This works like any other sails policy
     * http://sailsjs.org/#!documentation/policies
     */


    //grab sessionCooke from config
    sessionCookie = sails.config.authPolicy.endpoint.sessionCookie;

    if (!req.cookies[sessionCookie]) {

        return res.send(401, 'Not Authorized Noob');
    }

    //checks to see if post request contains actor.aid
    if (req.method === 'POST') {
        userId = ((req.body.actor || {}).aid || null);

        if (userId === null) {
            return res.send(400, 'Bad Request');
        }
    }
    else if (req.method === 'DELETE') {
        userId = (req.param('actor_id') || null);

        if (userId === null) {
            return res.send(400, 'Bad Request');
        }
    }

    var host, options;
    if (sails.config.authPolicy.endpoint.port) {
        host = sails.config.authPolicy.endpoint.host + ':' + sails.config.authPolicy.endpoint.port;
    } else {
        host = sails.config.authPolicy.endpoint.host;
    }

    // grab the cookie name used to verify a session
    options = {
        url: host + util.format(sails.config.authPolicy.endpoint.path, req.cookies[sessionCookie])
    };

    if (sails.config.authPolicy.endpoint.port === 443) {
        options.secureProtocol = 'SSLv3_method';
    }

    //request going out to the endpoint specificed
    var reqreq = request.get(options, function(error, response, body) {

        if (error || response == null) {
            sails.log.error("Something went worng at isAuthenticated. Make sure response is not null. \n response:", response, "\nError:", error);
            return res.send(500, 'INTERNAL SERVER ERROR');
        }

        if (response.statusCode >= 400) {
            return res.send(response.statusCode, 'BAD REQUEST');
        }

        try {
            var jsonBody = JSON.parse(body);

            if (jsonBody.userId && jsonBody.userId == userId) {
                return next();
            }

        } catch(e) {
            sails.log.error('Auth Service returns invalid json. ', e);
            return res.send(400, 'BAD REQUEST');
        };

        return res.send(401, 'Not Authorized Noob!!!!!');
    });

    //basic error handling
    reqreq.on('error', function(err) {
        sails.log.error('Bad Request to Auth Service.\n',err);
        return res.send(400, 'Bad Request to Auth Service');
    });
};
