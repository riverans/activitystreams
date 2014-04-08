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

    if (sails.config.authPolicy.policy) {
        return sails.config.authPolicy.policy(req, res, next);
    }
    return next();
}
