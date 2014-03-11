var request = require('request'),
    url = require('url'),
    assert = require('assert');

describe('Check Utility/Service Requests', function () {

    it('GET: / (setCookie)', function(done) {
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('STUB::POST: /subscribe {socket} (subscribe)', function(done) {
        assert.equal(1,1);
        done();
    });
});