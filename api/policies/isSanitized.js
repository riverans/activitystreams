/**
 * isSanitized 
 *
 * @module      :: Policy
 * @description :: Sanitize Cypher Queries
 *                 Returns a stop trying to hack json response
 * @docs        :: ??
 *
 */

var isCypher = require('sails-neo4j/lib/helpers/isCypher');
module.exports = function(req, res, next) {

  var url = req.url,
  specialCharReg = /[-!$%^&*()+|~=`{}\[\]:";'<>?,.]/;

  if (!isCypher(url) && !specialCharReg.test(url)) {
    return next();
  }
  return res.send(400, { error: 'Hacker!!!' });

};
