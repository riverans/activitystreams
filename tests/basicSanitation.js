var Sails = require('Sails'),
request = require('supertest'),
assert = require('assert'),
app;


//SetUp
before(function(done) {


    Sails.lift({
        log: {
            level: 'error'
        }
    }, function(err, sails){
        app = sails;
        done(err, sails);
    });
});

// After Function
after(function(done) {
    app.lower(done);
});

describe('Test MiddleWare Sanitiation', function () {

    it('it should reject on - character', function (done) {


        url = '/api/v1/mmdb_user-(object/'

        request(app.express.app)
        .get(url)
        .end(function (err, res){
            assert.equal(res.statusCode, 400)
            done();
        });

    });
});
