var request = require('request'),
    url = require('url'),
    assert = require('assert');

describe('Check Object Requests', function () {
    it('GET: object/{appname_model} (getAllObjectsOfType)', function(done) {
        baseUrl.pathname += 'object/photo';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('GET: object/{appname_model}/{id} (getSpecificObject)', function(done) {
        baseUrl.pathname += 'object/photo/10010';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body){
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('GET: object/{appname_model}/{id}/activities (getAllActivitiesByObject)', function (done) {
        baseUrl.pathname += 'object/photo/10010/activites';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('GET: object/{appname_model}/{id}/{verb} (getAllActorsWhoVerbedObject)', function (done) {
        baseUrl.pathname += 'object/photo/10010/FAVORITED';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body){
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('GET: object/{appname_model}/{id}/{verb}/{appname_model} (getSpecificActorTypeWhoVerbedObject)', function(done) {
        baseUrl.pathname += 'object/photo/10010/FAVORITED/user';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();

        });
    });
});