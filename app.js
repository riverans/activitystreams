// Start sails and pass it command line arguments
require('sails').lift(require('optimist').argv);

// App will not terminate on unhandled exceptions
process.on('uncaughtException', function() {});
