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
    if (!req.cookies.mmdbsessionid) {
        return next(new Error(401));
    }
    var userId = req.body.actor['aid'];
    var url = util.format('http://mmdb.dev.nationalgeographic.com:8000/api/v1/user/%i/', userId);
    http.get(url, function(res) {
        var data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            var jsonBody = JSON.parse(data);
            if (jsonBody.first_name && jsonBody.last_name && jsonBody.username) {
                return next();
            }
            return next(new Error(401));
        });
    });
}
