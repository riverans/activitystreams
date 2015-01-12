/* root-level hooks
 *
 *  "root" level hooks will run before any test-case.
 *  This is because Mocha has a root Suite with no name.
 *  http://visionmedia.github.io/mocha/#asynchronous-code
 */

var nock = require('nock'),
    sails = require('sails'),
    http = require('http');

before(function (done) {
    http.globalAgent.maxSockets = 100;
    process.env.testModeDebug = false; // cypher queries printed to console

    sails.lift({
        port: 9365,
        adapters: {
            neo4j: {
                protocol: 'http://',
                port: 7474,
                host: 'localhost',
                base: '/db/data/',
                debug: false
            }
        },

        authPolicy : {
            // endpoint config
            endpoint: {
                host: 'http://localhost',
                port: 6969,
                path: '/fakeSession=%s',
                sessionCookie: 'fakeSession'
            }
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
    sails.lower(done);
});

afterEach(function(done) {
    done();
});
