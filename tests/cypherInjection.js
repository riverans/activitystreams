var request = require('request'),
    url = require('url'),
    assert = require('assert'),
    testUtils = require('./utils');


describe('Test MiddleWare Sanitization', function () {

    it('should reject a url with Cypher', function (done) {
        baseUrl.pathname += 'actor/mmdb_user/MATCH/';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 420);
            done();
        });

    });


    it('Should reject a POST with Cypher', function (done) {
        server = testUtils.fakeServer({code:420, respond:{userId: 1}});
        var postBody = JSON.stringify({
                actor: {
                    type: 'user-(o)-(verb)',
                    aid: '1'
                },
                object: {
                    type: 'photo RETURN 1 /n MATCH (n) RETURN n',
                    aid: '1 COUNT(X)'
                },
                verb: {
                    type: 'FAVORITED'
                }
            }),
            requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

        server.on("listening", function() {
            testUtils.makeRequest(requestOptions, function (res) {
                assert.equal(res.statusCode, 420);
                server.close(done);
            });
        });

    });
});
