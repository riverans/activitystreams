var
    redis = require('redis'),
    sails = require('sails');


var keepAliveTick;

// Countdown to send keep alive message.
// Each time that you call it, a new countdown will replace the older one.
var timmerKeepAlive = function(delay) {
    if ( keepAliveTick ) clearTimeout(keepAliveTick);

    keepAliveTick = setTimeout(function() {
        if ( client.connected ) {
            sails.log.debug('Redis was inactive for ', delay / 60 / 1000 ,' minutes. Sending keep alive.');
            client.select(1);
        }
    }, delay);
}


client = redis.createClient(sails.config.adapters.redis.port, sails.config.adapters.redis.host, { retry_delay: 5000 });

module.exports = client;


client.on('connect',function() {
    sails.log.debug('RedisClient::Events[connect]: [OK] Redis is up. Connections: ', client.connections);
});

client.on('idle', function() {
    sails.log.debug('RedisClient::Events[idle].');
    timmerKeepAlive(1000*60*4);
});

client.on('error', function(e) {
    // sails.log.error('RedisClient::Events[error]: ', e);
    if (/ECONNREFUSED/g.test(e)) {

    }
});

// We avoid the uncaught exception spam.
redis.RedisClient.prototype.on_error = function (msg) {
    var message = "Redis connection to " + this.address + " failed - " + msg;

    if (this.closing) {
        return;
    }

    if (exports.debug_mode) {
        console.warn(message);
    }

    this.flush_and_error(message);

    this.connected = false;
    this.ready = false;

    sails.log.error('Critical error. ', message);
    //this.connection_gone("error");
}