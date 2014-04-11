/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
var http = require('http');
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

        return res.send(401, 'Not Authorized Noob')
    }

    //checks to see if post request contains actor.aid
    if (req.method === 'POST') {
        userId = ((req.body.actor || {}).aid || null);

        if (userId === null) {
            return res.send(400, 'Bad Request');
        }
    }

    // checks if DEL request contains actor_id in url params
    if(req.method === 'DELETE') {
        userId = req.param('actor_id') || null;

        if (userId === null) {
            return res.send(400, 'Bad Request');
        }
    }

    // grab the cookie name used to verify a session
    var options = {
        host: sails.config.authPolicy.endpoint.host,
        port: sails.config.authPolicy.endpoint.port,
        path : util.format(sails.config.authPolicy.endpoint.path, req.cookies[sessionCookie])
    };

    //request going out to the endpoint specificed
    var request = http.get(options, function(response) {

        //check auth service statusCode
        if(response.statusCode == 404) {
            return res.send(404, 'Auth is 404');
        }

        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function() {
            var jsonBody = JSON.parse(data);
            if (jsonBody.userId) {
                return next();
            }
            return res.send(401, 'Not Authorized Noob!!!!!')
        });
    });


    //basic error handling
    request.on('error', function(err) {
        console.log(err);
        return res.send(400, 'Bad Request to Auth Service');
    });
}
