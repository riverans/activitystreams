/* jslint node: true */
'use strict';

var sails = require('sails'),
    amqp = require('amqp'),
    Promise = require('es6-promise').Promise;

var callbacks = [],
    RabbitMQ = function() {
        this.running = false;

        // buffer to hold messages in queue until rabbit is ready to dispatch them.
        this.messages = [];

        return this.connect();
    };

RabbitMQ.prototype = {
    connect: function() {
        var self = this;

        sails.log.debug("Starting rabbit...");

        this.connection = amqp.createConnection(sails.config.connections.rabbit, {
            reconnectBackoffTime: 7000
        });

        this.connection.on('error', function(err) {
            sails.log.error('RabbitClient::Events[error]', err);
            self.connected = false;
        });

        // Ready event is fired every time on socket connects / reconnect.
        this.connection.on('ready', function() {

            sails.log.debug('RabbitClient::Events[ready]: [OK]. Port:', self.connection.options.port);

            sails.on('lower', self.onExit);

            self.createExchange({autoDelete: false, durable: false, type: 'direct'})
                .then(function() {
                    self.createQueue({autoDelete: false, confirm: true, durable: false, exclusive: true})
                        .then(function() {
                            self.bind();
                            self.running = true;
                            sails.log.debug('RabbitClient is running.');
                            self.flushMessages();
                        });
                });
        });
    },

    createExchange: function(options) {
        var self = this;
        sails.log.debug("Creating exchange...");

        return new Promise(function(resolve, reject) {
            self.exchange = self.connection.exchange(sails.config.connections.rabbit.exchange, options, resolve);
        });
    },

    createQueue: function(options) {
        var self = this;

        return new Promise(function(resolve, reject) {
            self.queue = self.connection.queue(sails.config.connections.rabbit.queue, options, resolve);
        });
    },

    onExit: function() {
        sails.log('Shutting down rabbit.');
        // Flush data on exit
        sails.services.rabbitmq.connection.disconnect();
    },

    flushMessages: function() {
        if (this.messages.length) {
            this.publish(this.messages.pop());
        }
    },

    subscribe: function(key, callback) {
        /** Check if key is in allowed Rabbit keys. Allow '*' for any key. */
        if (['*'].concat(sails.config.connections.rabbit.subscriberKeys).indexOf(key) < 0) {
            return false;
        }

        if (!callbacks[key]) {
            callbacks[key] = [];
        }

        callbacks[key].push(callback);
        return this;
    },

    bind: function() {
        this.queue.subscribe(function(message, headers, deliveryInfo) {
            /** Subscribe a basic callback that just reads messages. */
            this.subscribe('*', function(message, key) {
                sails.log('Reading msg: ', message);
                return sails.log('Routing key: ', key);
            });

            /** Execute the callbacks subscribed to all messages. */
            callbacks['*'].forEach(function(callback) {
                return callback(message, deliveryInfo.routingKey);
            });

            /** Execute the callbacks subscribed to a particular key. */
            if (callbacks[deliveryInfo.routingKey]) {
                callbacks[deliveryInfo.routingKey].forEach(function(callback) {
                    return callback(message);
                });
            }
        }.bind(this));

        /** Bind the queue to each routing key in the config. */
        sails.config.connections.rabbit.subscriberKeys.forEach(function(key) {
            this.queue.bind(this.exchange.name, key);
        }, this);
    },

    publish: function(data) {
        if (this.running) {
            this.exchange.publish(sails.config.connections.rabbit.publisherKey, data);
        } else {
            this.messages.push(data);
            sails.log('Rabbit is not ready. Message was saved.');
        }
    }
};

var client = new RabbitMQ();

module.exports = client;
