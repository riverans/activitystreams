/**
 * Local environment settings
 *
 * This config file should include any settings specific to a particular
 * environment (development / production).
 *
 * Note the configuration files located in /config/environments/.  That is where
 * environment-specific settings should be placed.  This 'local' configuration
 * module simply loads the settings from a file in that directory if one is
 * found that matches process.env.NODE_ENV.
 *
 * Also note that, if needed, you can create a file in /config/environments/
 * called 'myLocal.js'.  This file is included in .gitignore and will not be
 * committed, and should only be used if your particular local development
 * environment needs further customizations from what is found in the existing
 * 'development.js' configuration module.
 *
 * For more information, check out:
 * http://sailsjs.org/#documentation
 */

var fs = require('fs'),
     _ = require('lodash');

module.exports = (function() {

	var localConfig = {
		environment: process.env.NODE_ENV || 'development',
		port: process.env.PORT || 1337,
	};

        var envConfigs = [localConfig.environment + '.js', 'myLocal.js']
        for(var i=0; i <= envConfigs.length; i++) {
		configPath = __dirname + '/environments/' + envConfigs[i];
		if (fs.existsSync(configPath)) {
			_.merge(localConfig, require(configPath));
		}
	}

	return localConfig;
}());
