/* root-level hooks
 *
 *  "root" level hooks will run before any test-case. 
 *  This is because Mocha has a root Suite with no name.
 *  http://visionmedia.github.io/mocha/#asynchronous-code
 */

var nock = require('nock'),
    sails = require('sails');


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
    process.env.testMode = true; // enable mock responses from api/controllers/ActivityController.js
    process.env.testModeDebug = false; // cypher queries printed to console

    sails.lift({
        port: 9365,
        adapters: {
            default: 'neo4j'
        }
    }, done);
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
    nock.restore();
    sails.lower(done);
});

afterEach(function(done) {
    nock.cleanAll();
    done();
});
