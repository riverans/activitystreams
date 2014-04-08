var http = require('http');
var util = require('util');
module.exports = {
	port: 9365,
	environment: 'development',

    //auth policy configuration ==============================
    authPolicy : {

        //endpoint configuration ======================================
        endpoint: {
            host: '',
            port: '',
            pathname: '',
			sessionCookie: '',
        },

        /**
         * This is the generic Auth policy function that well take session Cookie and an endpoint
         * and will send each requset to the endpoint to authentication
         * This works like any other sails policy
         * http://sailsjs.org/#!documentation/policies
         */
        policy: function(req, res, next) {

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
                search: util.format('%s=%s', sessionCookie, req.cookies[sessionCookie])
            };

            //request going out to the endpoint specificed
            http.get(options, function(response) {
                var data = '';
                response.on('data', function(chunk) {
                    data += chunk;
                });
                response.on('end', function() {
                    var jsonBody = JSON.parse(data);
                    if (jsonBody.userId) {
                        return next();
                    }
                    return res.send(401, 'Not Authorized Noob')
                });
            });
        }
    }
}
