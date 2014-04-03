var request = require('request'),
    url = require('url'),
    assert = require('assert');


describe('Test MiddleWare Sanitization', function () {

    it('should reject a url with special charcters',  function (done) {
        baseUrl.pathname += 'object/mmdb_user-(object/';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 420);
            done();
        });
    });

    it('should reject a url with Cypher', function (done) {
        baseUrl.pathname += 'actor/mmdb_user/MATCH/';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 420);
            done();
        });

    });


    it('Should reject a POST with Cypher', function (done) {
        baseUrl.pathname += 'activity';
        var apiUrl = url.format(baseUrl);

        reqOptions = {
            url: apiUrl,
            method: 'POST',
            body: JSON.stringify({
                actor: {
                    type: 'user-(o)-(verb)',
                    user_id: '1'
                },
                object: {
                    type: 'photo RETURN 1 /n MATCH (n) RETURN n',
                    photo_id: '1 COUNT(X)'
                },
                verb: {
                    type: 'FAVORITED'
                }
            })
        };
        request.post(reqOptions, function (err, response, body) {
            assert.equal(response.statusCode, 420);
            done();
        });
    });
});
