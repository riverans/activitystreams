var assert = require('assert'),
    _ = require('lodash'),
    sails = require('sails'),
    redis = require('redis'),
    containsMember = function(members, member) {
        if (Object.prototype.toString.call(members) === '[object String]') {
            member = ';' + member + ';';
        }
        if (~members.indexOf(member)) {
            return true;
        }
        return false;
    },
    canBeDeletedBy = function(members, member) {
        var slash = member.indexOf('/');

        while (~slash) {
            member = member.substr(0, slash) + '\\' + member.substr(slash);
            slash = member.indexOf('/');
            slash = member[slash - 1] === '\\' ? -1 : slash;
        }
        if (~members.search(new RegExp('[;.]' + member + '[;.]'))) {
            return true;
        }
        return false;
    };

describe('Caching Service', function() {
    var data, client;

    before(function(done) {
        client = redis.createClient(sails.config.adapters.redis.port, sails.config.adapters.redis.host, {});
        done();
    });

    beforeEach(function(done) {
        data = [{
            actor: {
                data: {
                    aid: 69,
                    type: 'rap_cat'
                }
            },
            object: {
                data: {
                    aid: 1,
                    type: 'meow_meow'
                }
            },
            verb: {
                type: 'RAPPED'
            }
        }];
        done();
    });

    after(function(done) {
        var cb = function(err, reply) {
                done();
            };

        /** Flush old routes from redis. */
        client.select(2);
        client.keys('*/TEST/*', function(err, replies) {
            if (replies.length) {
                return client.mget(replies, function(err, replies2) {
                    replies.push(function() {
                        client.select(1);
                        replies2.push(cb);
                        /** Delete the urls after deleting the members. */
                        client.del.apply(client, replies2);
                    });
                    /** Delete the members. */
                    client.del.apply(client, replies);
                });
            }
            /** If no items were found, then resolve. */
            return cb();
        });
    });

    describe('Check write method', function() {
        var req;

        beforeEach(function(done) {
            var cb = function(err, reply) {
                    done();
                };

            req = {
                route: {
                    path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object/:object_id'
                },
                url: '/TEST/api/v1/actor/rap_cat/69/RAPPED/meow_meow/1'
            };

            /** Flush old routes from redis. */
            client.select(2);
            client.keys('*/TEST/*', function(err, replies) {
                if (replies.length) {
                    return client.mget(replies, function(err, replies2) {
                        replies.push(function() {
                            client.select(1);
                            replies2.push(cb);
                            /** Delete the urls after deleting the members. */
                            client.del.apply(client, replies2);
                        });
                        /** Delete the members. */
                        client.del.apply(client, replies);
                    });
                }
                /** If no items were found, then resolve. */
                return cb();
            });
        });

        it('should resolve with original data', function(done) {
            sails.services.caching.write(req, data).then(function(response) {
                assert.deepEqual(data, response);
                done();
            });
        });

        it('saved data should match original data', function(done) {
            sails.services.caching.write(req, data);

            client.select(1);
            client.get(req.url + '/', function(err, reply) {
                assert.deepEqual(data, JSON.parse(reply).data);
                done();
            });
        });

        it('should normalize the url', function(done) {
            sails.services.caching.write(req, data);

            client.select(1);
            client.get(req.url, function(err, reply) {
                assert.equal(reply, undefined);
                client.get(req.url + '/', function(err, reply) {
                    assert(typeof reply === 'string');
                    done();
                });
            });
        });

        it('should write the correct etag', function(done) {
            var crc32 = require('buffer-crc32'),
                replacer = sails.express.app.get('json replacer'),
                spaces = sails.express.app.get('json spaces');

            sails.services.caching.write(req, data);

            client.select(1);
            client.get(req.url + '/', function(err, reply) {
                assert.equal(JSON.parse(reply).etag, '"' + crc32.signed(JSON.stringify(data, replacer, spaces)) + '"');
                done();
            });
        });

        it('should correctly set members in second keyspace', function(done) {
            sails.services.caching.write(req, data);

            client.select(2);
            client.get(sails.services.caching._generateMembers({data: data, req: req}).writeMembers, function(err, reply) {
                assert.equal(reply, req.url + '/');
                done();
            });
        });
    });

    describe('Check bust method', function() {
        var req;

        beforeEach(function(done) {
            var cb = function(err, reply) {
                    done();
                };

            req = {
                route: {
                    path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object/:object_id'
                },
                url: '/TEST/api/v1/actor/rap_cat/69/RAPPED/meow_meow/1'
            };

            /** Flush old routes from redis. */
            client.select(2);
            client.keys('*/TEST/*', function(err, replies) {
                if (replies.length) {
                    return client.mget(replies, function(err, replies2) {
                        replies.push(function() {
                            client.select(1);
                            replies2.push(cb);
                            /** Delete the urls after deleting the members. */
                            client.del.apply(client, replies2);
                        });
                        /** Delete the members. */
                        client.del.apply(client, replies);
                    });
                }
                /** If no items were found, then resolve. */
                return cb();
            });
        });

        it('should bust custom member', function(done) {
            req.route.path = '/TEST/api/v1/proxy/:actor/:actor_id';
            req.url = '/TEST/api/v1/proxy/mc_kingkitty/1';

            sails.services.caching.write(req, data, 1, 'mc_kingkitty/1.');
            sails.services.caching.read(req.url).then(function(reply){
                assert.deepEqual(JSON.parse(reply).data, data);
                sails.services.caching.bust(req, [{actor: {data: {aid: 1, type: 'mc_kingkitty'}}}]).then(function() {
                    sails.services.caching.read(req.url).then(function(){}, function(err) {
                        assert.equal(err, 404);
                        done();
                    });
                });
            });
        });

        it('should be able to bust depth = 1', function(done) {
            sails.services.caching.write(req, data);

            sails.services.caching.read(req.url).then(function(reply){
                assert.deepEqual(JSON.parse(reply).data, data);
                sails.services.caching.bust(req, data).then(function() {
                    sails.services.caching.read(req.url).then(function(){}, function(err) {
                        assert.equal(err, 404);
                        done();
                    });
                });
            });
        });

        it('should be able to bust only depth = 2', function(done) {
            var data2 = _.cloneDeep(data),
                req2 = _.cloneDeep(req);
            sails.services.caching.write(req, data);
            req2.route.path = '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object';
            req2.url = '/TEST/api/v1/actor/rap_cat/69/RAPPED/meow_meow';
            delete data2[0].object.data.aid;
            sails.services.caching.write(req2, data2, 2);

            sails.services.caching.read(req2.url).then(function(reply){
                assert.deepEqual(JSON.parse(reply).data, data2);
                sails.services.caching.bust(req2, data2).then(function() {
                    sails.services.caching.read(req2.url).then(function(){}, function(err) {
                        assert.equal(err, 404);
                        sails.services.caching.read(req.url).then(function(reply) {
                            assert.deepEqual(JSON.parse(reply).data, data);
                            done();
                        });
                    });
                });
            });
        });

        it('should be able to bust only depth = 3', function(done) {
            var data2 = _.cloneDeep(data),
                req2 = _.cloneDeep(req);
            sails.services.caching.write(req, data);
            req2.route.path = '/TEST/api/v1/actor/:actor/:actor_id/:verb';
            req2.url = '/TEST/api/v1/actor/rap_cat/69/RAPPED';
            delete data2[0].object.data.aid;
            sails.services.caching.write(req2, data2, 3);

            sails.services.caching.read(req2.url).then(function(reply){
                assert.deepEqual(JSON.parse(reply).data, data2);
                sails.services.caching.bust(req2, data2).then(function() {
                    sails.services.caching.read(req2.url).then(function(){}, function(err) {
                        assert.equal(err, 404);
                        sails.services.caching.read(req.url).then(function(reply) {
                            assert.deepEqual(JSON.parse(reply).data, data);
                            done();
                        });
                    });
                });
            });
        });

        it('should be able to bust only depth = 4', function(done) {
            var data2 = _.cloneDeep(data),
                req2 = _.cloneDeep(req);
            sails.services.caching.write(req, data);
            req2.route.path = '/TEST/api/v1/actor/:actor/:actor_id';
            req2.url = '/TEST/api/v1/actor/rap_cat/69';
            delete data2[0].object.data.aid;
            sails.services.caching.write(req2, data2, 4);

            sails.services.caching.read(req2.url).then(function(reply){
                assert.deepEqual(JSON.parse(reply).data, data2);
                sails.services.caching.bust(req2, data2).then(function() {
                    sails.services.caching.read(req2.url).then(function(){}, function(err) {
                        assert.equal(err, 404);
                        sails.services.caching.read(req.url).then(function(reply) {
                            assert.deepEqual(JSON.parse(reply).data, data);
                            done();
                        });
                    });
                });
            });
        });

        it('should be able to bust only depth = 5', function(done) {
            var data2 = _.cloneDeep(data),
                req2 = _.cloneDeep(req);
            sails.services.caching.write(req, data);
            req2.route.path = '/TEST/api/v1/actor/:actor';
            req2.url = '/TEST/api/v1/actor/rap_cat';
            delete data2[0].object.data.aid;
            sails.services.caching.write(req2, data2, 5);

            sails.services.caching.read(req2.url).then(function(reply){
                assert.deepEqual(JSON.parse(reply).data, data2);
                sails.services.caching.bust(req2, data2).then(function() {
                    sails.services.caching.read(req2.url).then(function(){}, function(err) {
                        assert.equal(err, 404);
                        sails.services.caching.read(req.url).then(function(reply) {
                            assert.deepEqual(JSON.parse(reply).data, data);
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('Check read method', function() {
        var req;

        beforeEach(function(done) {
            var cb = function(err, reply) {
                    done();
                };

            req = {
                route: {
                    path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object/:object_id'
                },
                url: '/TEST/api/v1/actor/rap_cat/69/RAPPED/meow_meow/1'
            };

            /** Flush old routes from redis. */
            client.select(2);
            client.keys('*/TEST/*', function(err, replies) {
                if (replies.length) {
                    return client.mget(replies, function(err, replies2) {
                        replies.push(function() {
                            client.select(1);
                            replies2.push(cb);
                            /** Delete the urls after deleting the members. */
                            client.del.apply(client, replies2);
                        });
                        /** Delete the members. */
                        client.del.apply(client, replies);
                    });
                }
                /** If no items were found, then resolve. */
                return cb();
            });
        });

        it('should return a 404 for missing data', function(done) {
            sails.services.caching.read(req.url).then(function(){}, function(err) {
                assert.equal(err, 404);
                done();
            });
        });

        it('should return the correct data for a cached route', function(done) {
            sails.services.caching.write(req, data);

            sails.services.caching.read(req.url).then(function(reply) {
                assert(typeof reply === 'string');
                assert.deepEqual(JSON.parse(reply).data, data);
                done();
            });
        });

        it('should normalize the url', function(done) {
            sails.services.caching.write(req, data);

            sails.services.caching.read(req.url).then(function(reply) {
                sails.services.caching.read(req.url + '/').then(function(reply2) {
                    assert.equal(reply, reply2);
                    done();
                });
            });
        });
    });

    describe('Check _generateMembers method', function() {
        describe('all depths', function() {
            it('should generate proper bust members', function(done) {
                var req, members, invertedMembers;
                req = {route: {path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object/:object_id'}};
                members = sails.services.caching._generateMembers({data: data, req: req});
                assert(containsMember(members.bustMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members.bustMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members.bustMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(members.bustMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members.bustMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(members.bustMembers, 'rap_cat/69.'));
                assert(containsMember(members.bustMembers, '.meow_meow/1'));
                assert(containsMember(members.bustMembers, 'rap_cat/'));
                assert(containsMember(members.bustMembers, '.meow_meow'));
                done();
            });
            it('should generate write members containing custom member', function(done) {
                var req, members, invertedMembers;
                req = {route: {path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object/:object_id'}};
                members = sails.services.caching._generateMembers({data: data, req: req, custom: 'youknowhe\'sphat'});
                assert(~members.writeMembers.indexOf('youknowhe\'sphat'));
                assert(!~members.bustMembers.indexOf('youknowhe\'sphat'));
                done();
            });
            it('should generate write members containing the path', function(done) {
                var req, members, invertedMembers;
                req = {route: {path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object/:object_id'}};
                members = sails.services.caching._generateMembers({data: data, req: req});
                assert(~members.writeMembers.indexOf(req.route.path));
                assert(!~members.bustMembers.indexOf(req.route.path));
                done();
            });
        });
        describe('depth = 1', function() {
            var req, members, invertedMembers;
            beforeEach(function(done) {
                req = {route: {path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object/:object_id'}};
                members = sails.services.caching._generateMembers({data: data, req: req, depth: 1});
                invertedMembers = sails.services.caching._generateMembers({data: data, req: req, depth: 1, inverted: true});
                done();
            });
            it('should generate proper write members', function(done) {
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert.equal(invertedMembers.writeMembers, members.writeMembers);
                done();
            });
            it('can be deleted by actor and object', function(done) {
                assert(canBeDeletedBy(members.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(members.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'meow_meow/1'));
                done();
            });
            it('should create unique keys for different routes with same activity', function(done) {
                req = {route: {path: '/TEST/api/v1/object/:object/:object_id/:verb/:actor/:actor_id'}};
                var members2 = sails.services.caching._generateMembers({data: data, req: req, depth: 1});
                assert(members.writeMembers !== members2.writeMembers);
                done();
            });
        });
        describe('depth = 2', function() {
            var req, invertedReq, members, invertedMembers, data2, members2, invertedMembers2;
            beforeEach(function(done) {
                req = {route: {path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object'}};
                invertedReq = {route: {path: '/TEST/api/v1/object/:object/:object_id/:verb/:actor'}};
                members = sails.services.caching._generateMembers({data: data, req: req, depth: 2});
                invertedMembers = sails.services.caching._generateMembers({data: data, req: invertedReq, depth: 2, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].object.data.aid;
                members2 = sails.services.caching._generateMembers({data: data2, req: req, depth: 2});
                data2 = _.cloneDeep(data);
                delete data2[0].actor.data.aid;
                invertedMembers2 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 2, inverted: true});
                done();
            });
            it('should generate proper write members', function(done) {
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(!containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(!containsMember(invertedMembers2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(invertedMembers.writeMembers !== members.writeMembers);
                assert(invertedMembers2.writeMembers !== members2.writeMembers);
                done();
            });
            it('can be deleted by actor and object', function(done) {
                assert(canBeDeletedBy(members.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(members.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members2.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members2.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers2.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers2.writeMembers, 'meow_meow/1'));
                done();
            });
            it('should create unique keys for different routes with same activity', function(done) {
                req = {route: {path: '/TEST/api/v1/object/:object/:object_id/:verb/:actor'}};
                var alternateMembers = sails.services.caching._generateMembers({data: data, req: req, depth: 2});
                assert(members.writeMembers !== invertedMembers.writeMembers);
                assert(members.writeMembers !== alternateMembers.writeMembers);
                assert(invertedMembers.writeMembers !== alternateMembers.writeMembers);
                done();
            });
        });
        describe('depth = 3', function() {
            var req, invertedReq, members, invertedMembers, data2, members2, invertedMembers2, members3, invertedMembers3;
            beforeEach(function(done) {
                req = {route: {path: '/TEST/api/v1/actor/:actor/:actor_id/:verb'}};
                invertedReq = {route: {path: '/TEST/api/v1/object/:object/:object_id/:verb'}};
                members = sails.services.caching._generateMembers({data: data, req: req, depth: 3});
                invertedMembers = sails.services.caching._generateMembers({data: data, req: invertedReq, depth: 3, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].object.data.aid;
                members2 = sails.services.caching._generateMembers({data: data2, req: req, depth: 3});
                data2 = _.cloneDeep(data);
                delete data2[0].actor.data.aid;
                invertedMembers2 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 3, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].object;
                members3 = sails.services.caching._generateMembers({data: data2, req: req, depth: 3});
                data2 = _.cloneDeep(data);
                delete data2[0].actor;
                invertedMembers3 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 3, inverted: true});
                done();
            });
            it('should generate proper write members', function(done) {
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, '.RAPPED.meow_meow/1'));
                assert(!containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(!containsMember(invertedMembers2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, '.RAPPED.meow_meow/1'));
                assert(!containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(!containsMember(invertedMembers3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers3.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers3.writeMembers, '.RAPPED.meow_meow/1'));
                assert(invertedMembers.writeMembers !== members.writeMembers);
                assert(invertedMembers2.writeMembers !== members2.writeMembers);
                assert(invertedMembers3.writeMembers !== members3.writeMembers);
                done();
            });
            it('can be deleted by actor and object', function(done) {
                assert(canBeDeletedBy(members.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(members.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members2.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members2.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers2.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers2.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members3.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members3.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers3.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers3.writeMembers, 'meow_meow/1'));
                done();
            });
            it('should create unique keys for different routes with same activity', function(done) {
                req = {route: {path: '/TEST/api/v1/object/:object/:object_id/:verb'}};
                var alternateMembers = sails.services.caching._generateMembers({data: data, req: req, depth: 3});
                assert(members.writeMembers !== invertedMembers.writeMembers);
                assert(members.writeMembers !== alternateMembers.writeMembers);
                assert(invertedMembers.writeMembers !== alternateMembers.writeMembers);
                done();
            });
        });
        describe('depth = 4', function() {
            var req, invertedReq, members, invertedMembers, data2, members2, invertedMembers2, members3, invertedMembers3, members4, invertedMembers4;
            beforeEach(function(done) {
                req = {route: {path: '/TEST/api/v1/actor/:actor/:actor_id'}};
                invertedReq = {route: {path: '/TEST/api/v1/object/:object/:object_id'}};
                members = sails.services.caching._generateMembers({data: data, req: req, depth: 4});
                invertedMembers = sails.services.caching._generateMembers({data: data, req: invertedReq, depth: 4, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].object.data.aid;
                members2 = sails.services.caching._generateMembers({data: data2, req: req, depth: 4});
                data2 = _.cloneDeep(data);
                delete data2[0].actor.data.aid;
                invertedMembers2 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 4, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].object;
                members3 = sails.services.caching._generateMembers({data: data2, req: req, depth: 4});
                data2 = _.cloneDeep(data);
                delete data2[0].actor;
                invertedMembers3 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 4, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].verb;
                members4 = sails.services.caching._generateMembers({data: data2, req: req, depth: 4});
                invertedMembers4 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 4, inverted: true});
                done();
            });
            it('should generate proper write members', function(done) {
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, '.meow_meow/1'));
                assert(!containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.'));
                assert(!containsMember(invertedMembers2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, '.meow_meow/1'));
                assert(!containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members3.writeMembers, 'rap_cat/69.'));
                assert(!containsMember(invertedMembers3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers3.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers3.writeMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers3.writeMembers, '.meow_meow/1'));
                assert(!containsMember(members4.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(members4.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(!containsMember(members4.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members4.writeMembers, 'rap_cat/69.'));
                assert(!containsMember(invertedMembers4.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers4.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers4.writeMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers4.writeMembers, '.meow_meow/1'));
                assert(invertedMembers.writeMembers !== members.writeMembers);
                assert(invertedMembers2.writeMembers !== members2.writeMembers);
                assert(invertedMembers3.writeMembers !== members3.writeMembers);
                assert(invertedMembers4.writeMembers !== members4.writeMembers);
                done();
            });
            it('can be deleted by actor and object', function(done) {
                assert(canBeDeletedBy(members.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(members.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members2.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members2.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers2.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers2.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members3.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members3.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers3.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers3.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members4.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members4.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers4.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers4.writeMembers, 'meow_meow/1'));
                done();
            });
            it('should create unique keys for different routes with same activity', function(done) {
                req = {route: {path: '/TEST/api/v1/object/:object/:object_id'}};
                var alternateMembers = sails.services.caching._generateMembers({data: data, req: req, depth: 4});
                assert(members.writeMembers !== invertedMembers.writeMembers);
                assert(members.writeMembers !== alternateMembers.writeMembers);
                assert(invertedMembers.writeMembers !== alternateMembers.writeMembers);
                done();
            });
        });
        describe('depth = 5', function() {
            var req, invertedReq, members, invertedMembers, data2, members2, invertedMembers2, members3, invertedMembers3, members4, invertedMembers4, members5, invertedMembers5;
            beforeEach(function(done) {
                req = {route: {path: '/TEST/api/v1/actor/:actor'}};
                invertedReq = {route: {path: '/TEST/api/v1/object/:object'}};
                members = sails.services.caching._generateMembers({data: data, req: req, depth: 5});
                invertedMembers = sails.services.caching._generateMembers({data: data, req: invertedReq, depth: 5, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].object.data.aid;
                members2 = sails.services.caching._generateMembers({data: data2, req: req, depth: 5});
                data2 = _.cloneDeep(data);
                delete data2[0].actor.data.aid;
                invertedMembers2 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 5, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].object;
                members3 = sails.services.caching._generateMembers({data: data2, req: req, depth: 5});
                data2 = _.cloneDeep(data);
                delete data2[0].actor;
                invertedMembers3 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 5, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].verb;
                members4 = sails.services.caching._generateMembers({data: data2, req: req, depth: 5});
                invertedMembers4 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 5, inverted: true});
                data2 = _.cloneDeep(data);
                delete data2[0].actor.data.aid;
                members5 = sails.services.caching._generateMembers({data: data2, req: req, depth: 5});
                data2 = _.cloneDeep(data);
                delete data2[0].object.data.aid;
                invertedMembers5 = sails.services.caching._generateMembers({data: data2, req: invertedReq, depth: 5, inverted: true});
                done();
            });
            it('should generate proper write members', function(done) {
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members.writeMembers, 'rap_cat/69.'));
                assert(containsMember(members.writeMembers, 'rap_cat/'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, '.meow_meow/1'));
                assert(containsMember(invertedMembers.writeMembers, '.meow_meow'));
                assert(!containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members2.writeMembers, 'rap_cat/69.'));
                assert(containsMember(members2.writeMembers, 'rap_cat/'));
                assert(!containsMember(invertedMembers2.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, '.meow_meow/1'));
                assert(containsMember(invertedMembers2.writeMembers, '.meow_meow'));
                assert(!containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(containsMember(members3.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members3.writeMembers, 'rap_cat/69.'));
                assert(containsMember(members3.writeMembers, 'rap_cat/'));
                assert(!containsMember(invertedMembers3.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers3.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers3.writeMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers3.writeMembers, '.meow_meow/1'));
                assert(containsMember(invertedMembers3.writeMembers, '.meow_meow'));
                assert(!containsMember(members4.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(members4.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(!containsMember(members4.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(containsMember(members4.writeMembers, 'rap_cat/69.'));
                assert(containsMember(members4.writeMembers, 'rap_cat/'));
                assert(!containsMember(invertedMembers4.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers4.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers4.writeMembers, '.RAPPED.meow_meow/1'));
                assert(containsMember(invertedMembers4.writeMembers, '.meow_meow/1'));
                assert(containsMember(invertedMembers4.writeMembers, '.meow_meow'));
                assert(!containsMember(members5.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(members5.writeMembers, 'rap_cat/69.RAPPED.meow_meow/'));
                assert(!containsMember(members5.writeMembers, 'rap_cat/69.RAPPED.'));
                assert(!containsMember(members5.writeMembers, 'rap_cat/69.'));
                assert(containsMember(members5.writeMembers, 'rap_cat/'));
                assert(!containsMember(invertedMembers5.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers5.writeMembers, 'rap_cat/.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers5.writeMembers, '.RAPPED.meow_meow/1'));
                assert(!containsMember(invertedMembers5.writeMembers, '.meow_meow/1'));
                assert(containsMember(invertedMembers5.writeMembers, '.meow_meow'));
                assert(invertedMembers.writeMembers !== members.writeMembers);
                assert(invertedMembers2.writeMembers !== members2.writeMembers);
                assert(invertedMembers3.writeMembers !== members3.writeMembers);
                assert(invertedMembers4.writeMembers !== members4.writeMembers);
                assert(invertedMembers5.writeMembers !== members5.writeMembers);
                done();
            });
            it('can be deleted by neither actor nor object', function(done) {
                assert(canBeDeletedBy(members.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(members.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members2.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members2.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers2.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers2.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members3.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members3.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers3.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers3.writeMembers, 'meow_meow/1'));
                assert(canBeDeletedBy(members4.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members4.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers4.writeMembers, 'rap_cat/69'));
                assert(canBeDeletedBy(invertedMembers4.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(members5.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(members5.writeMembers, 'meow_meow/1'));
                assert(!canBeDeletedBy(invertedMembers5.writeMembers, 'rap_cat/69'));
                assert(!canBeDeletedBy(invertedMembers5.writeMembers, 'meow_meow/1'));
                done();
            });
            it('should create unique keys for different routes with same activity', function(done) {
                req = {route: {path: '/TEST/api/v1/object/:object/:object_id'}};
                var alternateMembers = sails.services.caching._generateMembers({data: data, req: req, depth: 4});
                assert(members.writeMembers !== invertedMembers.writeMembers);
                assert(members.writeMembers !== alternateMembers.writeMembers);
                assert(invertedMembers.writeMembers !== alternateMembers.writeMembers);
                done();
            });
        });
    });

    describe('Check _data method', function() {
        var req,
            activity = {actor: {data: {aid: 69, type: 'rap_cat'}}, verb: {type: 'RAPPED'}, object: {data: {aid: 1, type: 'meow_meow'}}};

        beforeEach(function(done) {
            req = {
                route: {
                    path: '/TEST/api/v1/actor/:actor/:actor_id/:verb/:object/:object_id'
                },
                url: '/TEST/api/v1/actor/rap_cat/69/RAPPED/meow_meow/1',
                param: function(key) {
                    return this.params[key];
                },
                params: {
                    actor: 'rap_cat',
                    actor_id: 69,
                    verb: 'RAPPED',
                    object: 'meow_meow',
                    object_id: 1
                }
            };
            return done();
        });

        describe('no data', function() {
            it('should generate activity data', function(done) {
                var data = sails.services.caching._data(req);
                assert(Array.isArray(data));
                assert(data.length === 1);
                assert.deepEqual(activity, data[0]);
                done();
            });
            it('should generate bustable data', function(done) {
                var options = {data: sails.services.caching._data(req), req: req},
                    members = sails.services.caching._generateMembers(options);

                assert(canBeDeletedBy(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                done();
            });
        });

        describe('empty array', function() {
            it('should generate activity data', function(done) {
                var data = sails.services.caching._data(req, []);
                assert(Array.isArray(data));
                assert(data.length === 1);
                assert.deepEqual(activity, data[0]);
                done();
            });
            it('should generate bustable data', function(done) {
                var options = {data: sails.services.caching._data(req), req: req},
                    members = sails.services.caching._generateMembers(options);

                assert(canBeDeletedBy(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                done();
            });
        });

        describe('array with empty items', function() {
            it('should generate activity data', function(done) {
                var data = sails.services.caching._data(req, [{items:[], totalItems:{}}]);
                assert(Array.isArray(data));
                assert(data.length === 1);
                assert.deepEqual(activity, data[0]);
                done();
            });
            it('should generate bustable data', function(done) {
                var options = {data: sails.services.caching._data(req), req: req},
                    members = sails.services.caching._generateMembers(options);

                assert(canBeDeletedBy(members.writeMembers, 'rap_cat/69.RAPPED.meow_meow/1'));
                done();
            });
        });
    });
});
