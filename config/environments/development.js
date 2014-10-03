module.exports = {
    port: 9365,
    environment: 'development',

    //auth policy configuration ==============================
    authPolicy : {

        //endpoint configuration ======================================
        endpoint: {
            host: '',
            port: 8000,
            path: '',
            sessionCookie: ''
        },
    },

    adapters: {

        neo4j: {
            protocol: 'http://',
            port: 7474,
            host: 'localhost',
            base: '/db/data/',
        },
        redis: {
            port: 6379,
            host: 'localhost',
            // db: 'cache'
        }
    },

    sockets: {
        adapter: 'redis',
        host: '127.0.0.1',
        port: 6379,
        db: 'sails',
    },

    session: {
        adapter: 'redis',
        host: 'localhost',
        port: 6379,
        db: 0,
        pass: '',
        prefix: 'sess',
        secret: ''
    }
};
