/**
 * isSanitized 
 *
 * @module      :: Policy
 * @description :: Sanitize Cypher Queries
 *                 Returns a stop trying to hack json response
 * @docs        :: ??
 *
 */

module.exports = function(req, res, next) {
  if (Activity.adapter.sanitized(req.params) && Activity.adapter.sanitized(req.body)) {
    return next();
  }
  return res.send(420, { error: 'Hacker!!!' });

};
