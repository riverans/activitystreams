module.exports.connections = {
    disk: {
        adapter: 'sails-disk'
    },
    myLocalMySQLDatabase: {
        adapter: 'sails-mysql',
        host: "YOUR_MYSQL_SERVER_HOSTNAME_OR_IP_ADDRESS",
        user: "YOUR_MYSQL_USER",
        password: "YOUR_MYSQL_PASSWORD",
        database: "YOUR_MYSQL_DB"
    },
    redis: {
        port: 6379,
        host: "localhost"
    },
    neo4j: {
        adapter: "sails-neo4j",
        debug: true,
        protocol: "http://",
        port: 7474,
        host: "localhost",
        base: "/db/data/"
    },
    rabbit: {
        host: "localhost",
        port: 5672,
        login: "guest",
        password: "guest",
        authMechanism: "AMQPLAIN",
        vhost: "/"
    }
};
