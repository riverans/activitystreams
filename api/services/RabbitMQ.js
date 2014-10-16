'use strict';

var
  sails = require('sails'),
  amqp = require('amqp'),
  Promise = require('es6-promise').Promise;


var rabbitInit = new Promise(function(resolve, reject) {
  var connection = amqp.createConnection(sails.config.adapters.rabbit.host, sails.config.adapters.rabbit.port);

  connection.on('ready', function() {
    sails.log.debug('RabbitClient::Events[ready]: [OK]. Port:', connection.options.port);

    sails.on('lower',function() {
      // Flush data on exit
      connection.close();
    });

    resolve(connection);
  });

  connection.on('error', function(err) {
    reject(err);
  });

  return connection;
});


module.exports = {

  publish: function(msg) {
    rabbitInit.then(function(connection) {
      connection.exchange('horizon', { autoDelete: false, durable: true }, function (exchange) {
        exchange.publish('horizon', {}, msg, function(status) {

        });
      });
    });
  }
};
