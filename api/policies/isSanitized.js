/**
 * isSanitized 
 *
 * @module      :: Policy
 * @description :: Sanitize Cypher Queries
 *                 Returns a stop trying to hack json response
 * @docs        :: ??
 *
 */

var isCypherInjectionFree = require('sails-neo4j/lib/helpers/isCypherInjectionFree');
module.exports = function(req, res, next) {

  var url = req.url;
  if (isCypherInjectionFree(url)) {
    return next();
  }
  return res.send(400, { error: 'Hacker!!!' });

};
