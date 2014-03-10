var request = require('request'),
    url = require('url'),
    assert = require('assert');


describe('Test Basic API End Points', function() {

    describe('Check Basic Get Requests', function () {

        it('Check response for setting auth cookie endpoint', function(done) {
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('Check response for actor type endpoint', function(done) {
            baseUrl.pathname += 'user';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('Check response for specific actor endpoint', function(done) {
            baseUrl.pathname += 'user/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body){
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('Check response for specific actors activities', function (done) {
            baseUrl.pathname += 'user/1/FAVORITED';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body){
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('Check response for all verbs of specific actor', function (done) {
            baseUrl.pathname += 'user/1/activites';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('check response for specific object typed verbed by actor', function(done) {
            baseUrl.pathname += 'user/1/favorited/picture';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();

            });
        });

        it('check response for specific activity', function (done) {
            baseUrl.pathname += 'user/1/FAVORITED/picture/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
    });

    describe('Check Basic Post Request', function () {
        it('check response for posting specific activity', function (done) {
            baseUrl.pathname += 'activity';
            var apiUrl = url.format(baseUrl);

            reqOptions = {
                url: apiUrl,
                method: 'POST',
                body: JSON.stringify({
                    actor: {
                        type: 'mmdb_user',
                        mmdb_user_id: 1
                    },
                    object: {
                        type: 'yourshot_photo',
                        yourshot_photo_id: '1'
                    },
                    verb: {
                        type: 'FAVORITED'
                    }
                })
            };
            request.post(reqOptions, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
    });

    describe('Check Basic DEL request', function () {
        it("check response for deleting specific activity", function(done) {
            baseUrl.pathname += 'user/1/FAVORITED/picture/1';
            var apiUrl = url.format(baseUrl);
            request.del(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
    });
});
