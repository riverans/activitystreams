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
    sails.lower(done);
});

afterEach(function() {
    nock.cleanAll();
});

describe('Check Object Requests', function () {
    it('Check response for object type endpoint (getAllObjectsOfType)', function(done) {
        baseUrl.pathname += 'object/photo';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('Check response for specific object endpoint (getSpecificObject)', function(done) {
        baseUrl.pathname += 'object/photo/10010';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body){
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('Check response for all verbs of specific object (getAllActivitiesByObject)', function (done) {
        baseUrl.pathname += 'object/photo/10010/activites';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('Check response for specific object activities (getAllActorsWhoVerbedObject)', function (done) {
        baseUrl.pathname += 'object/photo/10010/FAVORITED';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body){
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('check response for specific actor type who verbed an object (getSpecificActorTypeWhoVerbedObject)', function(done) {
        baseUrl.pathname += 'object/photo/10010/FAVORITED/user';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();

        });
    });
});