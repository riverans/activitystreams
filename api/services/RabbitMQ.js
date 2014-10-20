'use strict';

var
    sails = require('sails'),
    amqp = require('amqp'),
    Promise = require('es6-promise').Promise;


var createRabbitMQ = function() {
    return new Promise(function(resolve, reject) {
        var connection = amqp.createConnection(sails.config.adapters.rabbit, {
            reconnectBackoffTime: 5000
        });

        connection.on('ready', function() {
            sails.log.debug('RabbitClient::Events[ready]: [OK]. Port:', connection.options.port);

            sails.on('lower',function() {
                // Flush data on exit
                connection.close();
            });

            return resolve(connection);
        });

        connection.on('error', function(err) {
            sails.log.error('RabbitClient::Events[error]:', err);
            return reject(err, connection);
        });

        return connection;
    });
};

var rabbitClient  = createRabbitMQ();


module.exports = {

    publish: function(msg) {
        rabbitClient.then(function(connection) {
            connection.exchange('horizon', { autoDelete: false, durable: false }, function (exchange) {
                exchange.publish('horizon', {}, msg, function(status) {
                    sails.log('publish horizon message:', msg, ' \n status:', status);
                });
            });
        });
  }
};
