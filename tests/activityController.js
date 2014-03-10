var request = require('request'),
    url = require('url'),
    assert = require('assert');

describe('Check Activity Requests', function () {
    it('GET: /activity/{appname_model}/{id}/{verb}/{appname_model}/{id} (getSpecificActivity)', function (done) {
        baseUrl.pathname += 'activity/user/1/FAVORITED/picture/10010';
        var apiUrl = url.format(baseUrl);
        request(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('POST: /activity {activity} (postSpecificActivity)', function (done) {
        baseUrl.pathname += 'activity';
        var apiUrl = url.format(baseUrl);

        reqOptions = {
            url: apiUrl,
            method: 'POST',
            body: JSON.stringify({
                actor: {
                    type: 'user',
                    user_id: 1
                },
                object: {
                    type: 'photo',
                    photo_id: '1'
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

    it('DELETE: /activity/{appname_model}/{id}/{verb}/{appname_model}/{id} (deleteSpecificActivity)', function(done) {
        baseUrl.pathname += 'activity/user/1/FAVORITED/picture/1';
        var apiUrl = url.format(baseUrl);
        request.del(apiUrl, function (err, response, body) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });
});