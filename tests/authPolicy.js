var request = require('request');
var assert = require('assert');
var url = require('url');
var http = require('http');
var testUtils = require('./utils');

describe(' Test Auth Policy', function () {


    describe('Test POST responses', function(){

        it('should reject request with no mmdbsession cookie', function (done) {
            baseUrl.pathname += 'activity';
            apiUrl = url.format(baseUrl);
            request.post(apiUrl, function (err, res, body) {
                assert.equal(res.statusCode, 401);
                done();
            });

        });

        it('should reject unauthroized user ',  function (done) {

            testUtils.fakeServer({code: 401, respond: JSON.stringify({msg: 'noob'})});

            var postBody = testUtils.createTestJSON();
            var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

            testUtils.makeRequest(requestOptions, postBody, function(res){
                assert.equal(res.statusCode, 401);
                done();
            });
        });


        it('should allow authorize user to POST his/her activity', function(done) {

            testUtils.fakeServer({code: 200, respond: JSON.stringify({userId: 1121})});

            var postBody = testUtils.createTestJSON();
            var requestOptions = testUtils.createRequestOptions('POST', '/api/v1/activity', postBody);

            testUtils.makeRequest(requestOptions, postBody, function(res){
                assert.equal(res.statusCode, 200);
                done();
            });

        });
    });

    describe('Test DELETE responses', function() {

        it('should reject unauthroized user', function(done) {
            testUtils.fakeServer({code: 401, respond: JSON.stringify({msg: 'noob'})});

            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/activity/user/1/VERBED/object/1', '');

            testUtils.makeRequest(requestOptions, '', function(res){
                assert.equal(res.statusCode, 401);
                done();
            });
        });

        it('should allow authorize user to DELETE his/her activity', function(done) {
            testUtils.fakeServer({code: 200, respond: JSON.stringify({userId: 1121})});

            var requestOptions = testUtils.createRequestOptions('DELETE', '/api/v1/activity/user/1/VERBED/object/1', '');

            testUtils.makeRequest(requestOptions, '', function(res){
                assert.equal(res.statusCode, 200);
                done();
            });
        });

        it('should reject request with no mmdbsession cookie', function (done) {
            baseUrl.pathname = 'api/v1/activity/user/1/VERBED/object/1';
            apiUrl = url.format(baseUrl);
            request.del(apiUrl, function (err, res, body) {
                assert.equal(res.statusCode, 401);
                done();
            });
        });
    })
});
