var request = require('supertest'),
assert = require('assert');

describe('Test Basic API End Points', function() {
    describe('Check Basic Get Requests', function () {

        it('Check response for actor type endpoint', function(done) {

            url = '/api/v1/mmdb_user/';

            request(sails.express.app)
            .get(url)
            .end(function (err, res) { 
                assert.equal(res.statusCode, 200)
                done();
            });

        });

        it('Check response for specific actor endpoint', function(done) {

            url = '/api/v1/mmdb_user/1/';
            request(sails.express.app)
            .get(url)
            .end(function (err, res) {
                assert.equal(res.statusCode, 200);
                done();
            });
        });

        it('Check response for specific actors activites', function (done) {


            url = '/api/v1/mmdb_user/1/FAVORITED/'
            request(sails.express.app)
            .get(url)
            .end(function (err, response){
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('Check response for all verbs of specific actor', function (done) {
            url = '/api/v1/user/1/activities';
            request(sails.express.app)
            .get(url)
            .end(function (err, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });

        it('check response for specfic object typed verbed by actor', function(done) {
            url = '/api/v1/user/1/favorited/picture';
            request(sails.express.app)
            .get(url)
            .end(function (err, response) {
                assert.equal(response.statusCode, 200);
                done();

            });
        });

        it('check response for specfic activity', function (done) {
          url = '/api/v1/user/1/FAVORITED/picture/1';
            request(sails.express.app)
            .get(url)
            .end(function (err, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
    });

    describe('Check Basic Post Request', function () {
        it('check response for posting specific activity', function (done) {
            url = '/api/v1/activity/';

            postObj = {
                    actor: {
                        type: 'mmdb_user',
                        mmdb_user_id: 1
                    },
                    object: {
                        type: 'yourshot_photo',
                        yourshot_photo_id: '1'
                    },
                    verb: {
                        type: 'FAVORITED'
                    }
            };

            request(sails.express.app)
            .post(url)
            .send(postObj)
            .end(function (err, response) {
                assert.equal(response.statusCode, 200);
                done();
            });  
        });
    });

    describe('Check Basic DEL request', function () {
        it("check response for deleting specfic activity", function(done) {
            url = '/api/v1/mmdb_user/1/FAVORITED/picture/1';

            request(sails.express.app)
            .del(url)
            .end(function (err, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
    });
});
