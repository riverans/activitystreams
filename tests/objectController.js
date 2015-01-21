var request = require('request'),
    url = require('url'),
    assert = require('assert'),
    testUtils = require('./utils'),
    http = require('http'),
    server = {};

describe('Test Object Controller  ', function () {
    before(function(done) {
        /** Disable caching. */
        sails.config.cacheEnabled = false;
        /** Create activity for object test */
        server = testUtils.fakeServer({code:200, respond:{userId: 1}});
        var postBody = testUtils.createTestJSON();
        var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

        server.on("listening", function() {
            testUtils.makeRequest(requestOptions, function (res) {
                assert.equal(res.statusCode, 200);
                server.close(done);
            });
        });
    });

    after(function(done) {
        /** Enable caching. */
        sails.config.cacheEnabled = true;
        done();
    });

    describe('Check Object Requests', function () {
        it('GET: object/{appname_model} (getAllObjectsOfType)', function(done) {
            baseUrl.pathname += 'object/test_object';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.strictEqual(bodyResponse.length, 1);
                assert.equal(bodyResponse[0].object.data.type, "test_object");
                assert.ok(!bodyResponse[0].target);
                assert.ok(!bodyResponse[0].actor);
                done();
            });
        });

        it('GET: object/{appname_model}/{id} (getSpecificObject)', function(done) {
            baseUrl.pathname += 'object/test_object/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body){
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.strictEqual(bodyResponse.length, 1);
                assert.equal(bodyResponse[0].object.data.type, "test_object");
                assert.equal(bodyResponse[0].object.data.aid, 1);
                assert.ok(!bodyResponse[0].target);
                assert.ok(!bodyResponse[0].actor);
                done();
            });
        });

        it('GET: object/{appname_model}/{id}/activities (getAllActivitiesByObject)', function (done) {
            baseUrl.pathname += 'object/test_object/1/activities';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse[0].verb, "FAVORITED");
                assert.equal(bodyResponse[0].totalItems, 1);
                assert.equal(bodyResponse[0].items[0].object.data.type, "test_object");
                assert.equal(bodyResponse[0].items[0].object.data.aid, 1);
                assert.ok(bodyResponse[0].items[0].actor);
                assert.ok(bodyResponse[0].items[0].verb);
                done();
            });
        });

        it('GET: object/{appname_model}/{id}/{verb} (getAllActorsWhoVerbedObject)', function (done) {
            baseUrl.pathname += 'object/test_object/1/FAVORITED';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body){
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse[0].totalItems, 1);
                assert.equal(bodyResponse[0].items[0].object.data.type, "test_object");
                assert.equal(bodyResponse[0].items[0].object.data.aid, 1);
                assert.equal(bodyResponse[0].items[0].verb.type, "FAVORITED");
                assert.ok(bodyResponse[0].items[0].actor);
                done();
            });
        });

        it('GET: object/{appname_model}/{id}/{verb}/{appname_model} (getSpecificActorTypeWhoVerbedObject)', function(done) {
            baseUrl.pathname += 'object/test_object/1/FAVORITED/test_actor';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse[0].totalItems, 1);
                assert.equal(bodyResponse[0].items[0].object.data.type, "test_object");
                assert.equal(bodyResponse[0].items[0].object.data.aid, 1);
                assert.equal(bodyResponse[0].items[0].verb.type, "FAVORITED");
                assert.equal(bodyResponse[0].items[0].actor.data.type, "test_actor");
                done();
            });
        });

        it('GET: object/{appname_model}/{id}/{verb}/{appname_model}/{id} (getActivityByObject)', function(done) {
            baseUrl.pathname += 'object/test_object/1/FAVORITED/test_actor/1';
            var apiUrl = url.format(baseUrl);
            request(apiUrl, function (err, response, body) {
                var bodyResponse = JSON.parse(body);

                assert.equal(response.statusCode, 200);
                assert.equal(bodyResponse[0].object.data.type, "test_object");
                assert.equal(bodyResponse[0].object.data.aid, 1);
                assert.equal(bodyResponse[0].verb.type, "FAVORITED");
                assert.equal(bodyResponse[0].actor.data.type, "test_actor");
                assert.equal(bodyResponse[0].actor.data.aid, 1);
                assert.ok(!bodyResponse[0].target.id);
                done();
            });
        });
    });
});
