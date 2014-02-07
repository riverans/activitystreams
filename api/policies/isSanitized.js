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

  var url = req.url;

  if (url.indexOf('-') === -1) {
    console.log(url);
    return next();
  } 
  return res.send(400);
   
};
