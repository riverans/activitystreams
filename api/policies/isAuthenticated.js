/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Implement authentication policy
 * @docs        :: http://sailsjs.org/#!documentation/policies
 */
var request = require('request');
var https = require('https');
var util = require('util');

module.exports = function(req, res, next) {
    return next();
};
