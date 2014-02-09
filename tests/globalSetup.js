//Global Set Up for all tests
var Sails = require('Sails'),
app;


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

after(function(done) {
    app.lower(done);
});
