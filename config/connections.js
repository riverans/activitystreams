module.exports.connections = {
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
    }
};
