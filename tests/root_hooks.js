/* root-level hooks
 *
 *  "root" level hooks will run before any test-case.
 *  This is because Mocha has a root Suite with no name.
 *  http://visionmedia.github.io/mocha/#asynchronous-code
 */

var sails = require('sails'),
    http = require('http'),
    assert = require('assert'),
    testUtils = require('./utils');

before(function (done) {
    http.globalAgent.maxSockets = 100;
    process.env.testModeDebug = false; // cypher queries printed to console

    sails.lift({
        port: 9365,
        adapters: {
            default: 'neo4j'
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
    server = testUtils.fakeServer({code:200, respond:{userId: 1}});
    var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/actor/test_actor/1', '');

    server.on("listening", function() {
        testUtils.makeRequest(requestOptions, function (res) {
            assert.equal(res.statusCode, 200);

            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/actor/test_object/1', '');
            testUtils.makeRequest(requestOptions, function (res) {
                assert.equal(res.statusCode, 200);

                var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/actor/test_target/1', '');
                testUtils.makeRequest(requestOptions, function (res) {
                    assert.equal(res.statusCode, 200);
                    server.close();
                    sails.lower(done);
                });
            });
        });
    });
});

