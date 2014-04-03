//Global Set Up for all tests
var sails = require('Sails'),
	app;

before(function(done) {

    sails.lift({
        log: {
            level: 'error'
        }
    }, function(err, sails){
        app = sails;
        done(err, sails);
    });
});

after(function(done) {
    app.lower(done);
});
