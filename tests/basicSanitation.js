var request = require('supertest'),
assert = require('assert');


describe('Test MiddleWare Sanitiation', function () {

    it('it should reject url with special charcters',  function (done) {


        url = '/api/v1/mmdb_user-(object/';
        request(sails.express.app)
        .get(url)
        .end(function (err, res) { 
            assert.equal(res.statusCode, 400);
            done();
        });
    });

    it('shoudl reject url with Cypher Keyword', function (done) {
        url = '/api/v1/mmdb_user/MATCH/';
        request(sails.express.app)
        .get(url)
        .end(function (err, res) {
            assert.equal(res.statusCode, 400);
            done();
        });

    });
});
