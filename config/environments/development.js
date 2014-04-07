var http = require('http');
var util = require('util');
module.exports = {
	port: 9365,
	environment: 'development',


    //auth policy
    authPolicy : {
        endpoint: { // A url for your service's authentication endpoint
            host: 'mmdb.dev.nationalgeographic.com',
            port: 8000,
            pathname: '_membercenter/header/session-auth/'
        },
        policy: function(req, res, next) {
            if (!req.cookies.mmdbsessionid) {
                return res.send(401, 'Not Authorized Noob')
            }

            if (req.method === 'POST') {
                userId = ((req.body.actor || {}).aid || null);

                if (userId === null) {
                    return res.send(400, 'Bad Request');
                }
            }

            if(req.method === 'DELETE') {
                userId = req.param('actor_id') || null;

                if (userId === null) {
                    return res.send(400, 'Bad Request');
                }
            }

            var options = {
                host: sails.config.authPolicy.endpoint.host,
                port: sails.config.authPolicy.endpoint.port,
                search: util.format('%s=%s','mmdbsessionid', req.cookies['mmdbsessionid'])
            };

            //request going out to the endpoint
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
