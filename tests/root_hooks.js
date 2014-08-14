/* root-level hooks
 *
 *  "root" level hooks will run before any test-case.
 *  This is because Mocha has a root Suite with no name.
 *  http://visionmedia.github.io/mocha/#asynchronous-code
 */

var sails = require('sails'),
    http = require('http'),
    express = require('express');


// Set up Nock to intercept traffic to the Neo4j server
// Must match the server defined in config/adapters.js -or- in
// node_modules/sails-neo4j/lib/adapter.js
//
// Note that it is possible to run tests against the live database
// by omitting the use of Nock.  Be sure your server is running
// otherwise you will receive Uncaught Error: connect ECONNREFUSED
before(function (done) {
    process.env.testMode = true; // enable mock responses from api/controllers/ActivityController.js
    process.env.testModeDebug = false; // cypher queries printed to console
    http.globalAgent.maxSockets = 100;
    var neo4j = express().use('/db/data/', function(req, res) {
            res.send(200);
        }),
        neo4jServer = http.createServer(neo4j).listen(7474, function() {
            sails.lift({
                port: 9365,
                adapters: {
                    default: 'neo4j'
                }
            }, done);
        });
});

beforeEach(function(done) {
    // Base URL used to test the URLs in the endpoint tests
    baseUrl = {
        protocol: 'http',
        hostname: 'localhost',
        port: 9365,
        pathname: 'api/v1/'
    };
    done();
});

after(function (done) {
    sails.lower(done);
});

afterEach(function(done) {
    done();
});
