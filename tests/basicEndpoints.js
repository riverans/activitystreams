var request = require('request'),
    url = require('url'),
    assert = require('assert'),
    baseUrl = 'http://as.nationalgeographic.com:9365/api',
    apiVersion = '1';

beforeEach(function() { 


    baseUrl = {
        protocol: 'http',
        hostname: 'as.nationalgeographic.com',
        port: 9365,
        pathname: 'api/v1/'
    }
});

describe('Test Basic Api End Points', function() {
    describe(' Check all Get Requests', function () {

        it('Check response for actor type endpoint', function(done) {
           baseUrl.pathname += 'user'
           var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) { 
                assert.equal(response.statusCode, 200); 
                done();
            });
        });

        it('Check resposne of specific actor endpoint', function(done) {
            baseUrl.pathname += 'user/1'
            var apiUrl = url.format(baseUrl); 
            request(apiUrl, function (err, response, body){
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('Check resposne for specific actors activites', function (done) {
            baseUrl.pathname += 'user/1/FAVORITED'
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body){
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('Check response for all verbs of specifc actor', function (done) {
            baseUrl.pathname += 'user/1/activites';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('check resposne for specfic objet typed verbed by actor', function(done) {
            baseUrl.pathname += 'user/1/favorited/picture';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();

            });
        });

        it('check response for specfic activity', function (done) {
            baseUrl.pathname += 'user/1/FAVORITED/picture/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });

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
            }
            request.post(reqOptions, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });  
        });

        it("check response for deleting specfic activity", function(done) {
            baseUrl.pathname += 'user/1/FAVORITED/picture/1'
            var apiUrl = url.format(baseUrl);
            request.del(apiUrl, function (err, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
    });
});
