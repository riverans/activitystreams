/* jslint node: true */
'use strict';

var
    sails = require('sails'),
    amqp = require('amqp'),
    Promise = require('es6-promise').Promise;


var RabbitClient = function() {

    this.running = false;

    // buffer to hold messages in queue until rabbit is ready to dispatch them.
    this.messages = [];

    return this.connect();
};


RabbitClient.prototype = {

    connect: function() {
        var  self = this;

        sails.log.debug("Starting rabbit...");

        this.connection = amqp.createConnection(sails.config.adapters.rabbit, {
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
                            self.subscribe(self.queue);
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
            self.exchange = self.connection.exchange(sails.config.adapters.rabbit.exchange, options, resolve);
        });
    },

    createQueue: function(options) {
        var self = this;

        return new Promise(function(resolve, reject) {
            self.queue = self.connection.queue(sails.config.adapters.rabbit.queue, options, resolve);
        });
    },

    onExit: function() {
        sails.log('Shutting down rabbit.');
        // Flush data on exit
        this.connection.close();
    },

    flushMessages: function() {
        if (this.messages.length) {
            this.publish(this.messages.pop());
        }
    },

    subscribe: function(queue) {
        queue.subscribe(function(msg) {
            sails.log("Reading msg: ", msg);
        });
        queue.bind(this.exchange.name, sails.config.adapters.rabbit.routingKey);
    },

    publish: function(data) {
        if (this.running) {
            this.exchange.publish(sails.config.adapters.rabbit.routingKey, data);
        } else {
            this.messages.push(data);
            sails.log('Rabbit is not ready. Message was saved.');
        }
    }
};


var rabbitClient = new RabbitClient();

module.exports = rabbitClient;
