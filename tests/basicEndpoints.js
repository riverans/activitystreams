var request = require('request'),
    url = require('url'),
    assert = require('assert'),
    nock = require('nock');

// Set up Nock to intercept traffic to the Neo4j server
// Must match the server defined in config/adapters.js -or- in 
// node_modules/sails-neo4j/lib/adapter.js
// 
// Note that it is possible to run tests against the live database
// by omitting the use of Nock.  Be sure your server is running
// otherwise you will receive Uncaught Error: connect ECONNREFUSED
var neo4j = nock('http://localhost:7474')
                .get('/db/data/')
                .reply(200);

before(function (done) {
    // Set testMode to true to enable mock responses from api/controllers/ActivityController.js
    process.env.testMode = true;
    // Set testModeDebug to true if you want to see the cyper queries in the console
    process.env.testModeDebug = false;

    // Run a sails instance using the Neo4j adapter
    require('sails').lift({
        port: 9365,
        adapters: {
            default: 'neo4j' // defined in config/adapters.js
        }
    }, done);
});

beforeEach(function() { 
    // Base URL used to test the URLs in the endpoint tests
    baseUrl = {
        protocol: 'http',
        hostname: 'localhost',
        port: 9365,
        pathname: 'api/v1/'
    };
});

after(function (done) {
    nock.restore();
    require('sails').lower(done);
});

afterEach(function() {
    nock.cleanAll();
});

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
