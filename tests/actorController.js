var request = require('request'),
    url = require('url'),
    assert = require('assert');

describe('Check Actor Requests', function () {
    it('GET: actor/{appname_model} (getAllActorsOfType)', function(done) {
        baseUrl.pathname += 'actor/user';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('GET: actor/{appname_model}/{id} (getSpecificActor)', function(done) {
        baseUrl.pathname += 'actor/user/1';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body){
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('GET: actor/{appname_model}/{id}/activities (getAllActivitiesByActor)', function (done) {
        baseUrl.pathname += 'actor/user/1/activites';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('GET: actor/{appname_model}/{id}/{verb} (getAllObjectsVerbedByActor)', function (done) {
        baseUrl.pathname += 'actor/user/1/FAVORITED';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body){
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('GET: actor/{appname_model}/{id}/{verb}/{appname_model} (getSpecificObjectTypeVerbedByActor)', function(done) {
        baseUrl.pathname += 'actor/user/1/favorited/picture';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();

        });
    });

    it('GET: actor/{appname_model}/{id}/{verb}/{appname_model}/{id} (getActivityByActor)', function(done) {
        baseUrl.pathname += 'actor/user/1/favorited/picture/1';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();

        });
    });
});
