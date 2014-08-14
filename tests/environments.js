var request = require('request'),
    url = require('url'),
    assert = require('assert'),
    sails = require('sails');

/*
 * Notes on this test:
 *
 * By default, Sails sets its environment using the `NODE_ENV` environment variable.
 * If NODE_ENV is not set, Sails will run in the 'development' environment.
 *
 * sails.config.environment is normally set based on NODE_ENV in the
 * /config/local.js file.  However, we have environment-specific config
 * files in /config/environments/, so our /config/local.js was updated to
 * look for a file in /config/environments/ that matches NODE_ENV + '.js'.
 * If it's found, it loads those settings.  Each of these files is responsible
 * for setting the 'environment' setting for its environment.
 *
 * So this test basically asserts that whatever process.env.NODE_ENV is set to,
 * sails.conf.environment is also set to that.
 *
 *
 */
 
describe('Environment-specific config settings', function() {
    it("Gets the current settings based on NODE_ENV", function() {
            assert.equal(process.env.NODE_ENV, sails.config.environment); 
    });
});
